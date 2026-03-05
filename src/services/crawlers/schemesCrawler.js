const BaseCrawler = require('./BaseCrawler');
const logger = require('../logger');
const { query } = require('../../config/database');
const puppeteer = require('puppeteer');
require('dotenv').config();

/**
 * Enhanced SchemesCrawler with MyScheme.gov.in API Integration
 * Supports batch processing, pause/resume, and rich data extraction
 */
class SchemesCrawler extends BaseCrawler {
    constructor(source) {
        // Fallback for manual trigger if source not provided
        super(source || { id: 1, type: 'schemes', name: 'MyScheme' });
        this.apiBase = process.env.MYSCHEME_API_BASE;
        this.apiKey = process.env.MYSCHEME_API_KEY;
        this.batchSize = parseInt(process.env.CRAWLER_BATCH_SIZE) || 50;
        this.delayMs = parseInt(process.env.CRAWLER_DELAY_MS) || 2000;

        // Crawler state
        this.isPaused = false;
        this.isStopped = false;
        this.currentJobId = null;
    }

    /**
     * Main crawl method with batch processing
     */
    async execute() {
        return await this.crawl();
    }

    /**
     * Internal crawl method
     */
    async crawl() {
        try {
            logger.info('Starting MyScheme crawler with Puppeteer discovery strategy');

            // Create crawler job
            this.currentJobId = await this.createCrawlerJob();

            // Update global status
            await this.updateGlobalStatus(true, this.currentJobId);

            // Step 1: Discover Slugs
            logger.info('Discovering slugs...');
            let slugs = await this.discoverSlugs();

            if (slugs.length === 0) {
                logger.warn('Discovery failed or returned no schemes. Using fallback list.');
                slugs = [
                    'pmmy', 'sui', 'pmjdy', 'pmay', 'pmksy',
                    'pmjjby', 'pmsby', 'apy', 'pmegp', 'nsap',
                    'ayushman-bharat', 'swachh-bharat', 'skill-india',
                    'make-in-india', 'digital-india', 'startup-india',
                    'kisan-vikas-patra', 'sukanya-samriddhi-yojana'
                ];
            }

            logger.info(`Found ${slugs.length} schemes to process.`);

            // Update estimated total
            await query('UPDATE crawler_jobs SET estimated_total = $1 WHERE id = $2', [slugs.length, this.currentJobId]);

            // Step 2: Extract Data
            let totalFetched = 0;
            let currentBatch = 1;

            for (const slug of slugs) {
                if (this.isStopped) break;

                while (this.isPaused) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                try {
                    // Update job status
                    await this.updateJobProgress(this.currentJobId, {
                        current_batch: currentBatch++,
                        total_fetched: totalFetched,
                        status: `Fetching ${slug}`
                    });

                    // Fetch and save
                    const success = await this.fetchAndSaveScheme(slug);
                    if (success) {
                        totalFetched++;
                        // Increment success count
                        await query('UPDATE crawler_jobs SET success_count = success_count + 1 WHERE id = $1', [this.currentJobId]);
                    } else {
                        // Increment failed count
                        await query('UPDATE crawler_jobs SET failed_count = failed_count + 1 WHERE id = $1', [this.currentJobId]);
                    }

                    // Respectful delay
                    await new Promise(resolve => setTimeout(resolve, this.delayMs));

                } catch (err) {
                    logger.error(`Failed to fetch scheme ${slug}:`, err.message);
                    await this.incrementErrorCount(this.currentJobId);
                }
            }

            // Mark job as completed
            await this.completeCrawlerJob(this.currentJobId, totalFetched);

            // Update global status
            await this.updateGlobalStatus(false, null);

            logger.info(`Crawler completed successfully. Total schemes fetched: ${totalFetched}`);

            return totalFetched;

        } catch (error) {
            logger.error('Crawler error:', error);

            if (this.currentJobId) {
                await this.failCrawlerJob(this.currentJobId, error.message);
            }

            await this.updateGlobalStatus(false, null, error.message);

            throw error;
        }
    }

    async discoverSlugs() {
        let browser;
        const slugs = new Set();
        try {
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            logger.info('Navigating to search page...');
            await page.goto('https://www.myscheme.gov.in/search', { waitUntil: 'networkidle2', timeout: 60000 });

            try {
                await page.waitForSelector('a[href^="/schemes/"]', { timeout: 10000 });
            } catch (e) {
                logger.warn('Could not find scheme links initially.');
            }

            logger.info('Scrolling to load all schemes...');
            let previousHeight = 0;
            let retries = 0;
            while (retries < 30) { // Limit to 30 scrolls to avoid infinite loops
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                await new Promise(resolve => setTimeout(resolve, 2000));
                const currentHeight = await page.evaluate('document.body.scrollHeight');
                if (currentHeight === previousHeight) break;
                previousHeight = currentHeight;
                retries++;
            }

            const hrefs = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a[href^="/schemes/"]'));
                return anchors.map(a => a.getAttribute('href'));
            });

            hrefs.forEach(href => {
                const parts = href.split('/');
                if (parts.length >= 3) {
                    const slug = parts[2];
                    if (slug && !slug.includes('#') && !slug.includes('?')) {
                        slugs.add(slug);
                    }
                }
            });

        } catch (error) {
            logger.error('Error discovering slugs:', error);
        } finally {
            if (browser) await browser.close();
        }

        return Array.from(slugs);
    }

    async fetchAndSaveScheme(slug) {
        const url = `${this.apiBase}?slug=${slug}&lang=en`;
        const headers = {
            'x-api-key': this.apiKey || 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc', // Fallback to known working key
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };

        const response = await this.fetchWithRetry(url, { headers });

        if (response.status === 200 && response.data && response.data.statusCode === 200 && response.data.data) {
            const schemeData = response.data.data;

            // Normalize
            const normalized = this.normalizeScheme(schemeData);

            if (normalized) {
                // Save to DB
                await this.saveScheme(normalized);
                logger.info(`Successfully processed scheme: ${slug}`);
                return true;
            }
        } else {
            logger.warn(`Failed to fetch scheme ${slug}. Status: ${response.status}, API Status: ${response.data?.statusCode}`);
        }
        return false;
    }

    async processScheme(rawScheme) {
        try {
            // Enrich with additional data
            const enrichedScheme = await this.enrichSchemeData(rawScheme);

            // Normalize to database format
            const normalizedScheme = this.normalizeScheme(enrichedScheme);

            // Save to database
            const saved = await this.saveScheme(normalizedScheme);

            if (saved === 'duplicate') {
                logger.info(`Scheme ${rawScheme.slug} is a duplicate.`);
            } else {
                logger.info(`Successfully processed scheme: ${rawScheme.slug}`);
            }
            return saved;
        } catch (error) {
            logger.error(`Failed to process scheme ${rawScheme.slug}: ${error.message}`);
            throw error;
        }
    }

    async enrichSchemeData(scheme) {
        const schemeId = scheme._id;

        try {
            // Fetch additional data in parallel
            const [documents, faqs, channels] = await Promise.all([
                this.fetchSchemeDocuments(schemeId).catch(() => null),
                this.fetchSchemeFAQs(schemeId).catch(() => null),
                this.fetchApplicationChannels(schemeId).catch(() => null)
            ]);

            return {
                ...scheme,
                documents: documents?.data || [],
                faqs: faqs?.data || [],
                applicationChannels: channels?.data || []
            };

        } catch (error) {
            logger.warn(`Could not enrich scheme ${schemeId}: `, error.message);
            return scheme;
        }
    }

    /**
     * Fetch scheme documents
     */
    async fetchSchemeDocuments(schemeId) {
        const url = `${this.apiBase}/${schemeId}/documents?lang=en`;
        return await this.fetchWithRetry(url, {
            headers: { 'x-api-key': this.apiKey }
        });
    }

    /**
     * Fetch scheme FAQs
     */
    async fetchSchemeFAQs(schemeId) {
        const url = `${this.apiBase}/${schemeId}/faqs?lang=en`;
        return await this.fetchWithRetry(url, {
            headers: { 'x-api-key': this.apiKey }
        });
    }

    /**
     * Fetch application channels
     */
    async fetchApplicationChannels(schemeId) {
        const url = `${this.apiBase}/${schemeId}/applicationchannel`;
        return await this.fetchWithRetry(url, {
            headers: { 'x-api-key': this.apiKey }
        });
    }

    /**
     * Normalize scheme data to database format
     */
    normalizeScheme(rawScheme) {
        const langData = rawScheme.en || rawScheme.hi || {};
        const basicDetails = langData.basicDetails || {};
        const schemeContent = langData.schemeContent || {};
        const eligibility = langData.eligibilityCriteria || {};

        return {
            external_id: rawScheme._id,
            slug: rawScheme.slug,

            // Basic info
            title: basicDetails.schemeName || 'Untitled Scheme',
            short_title: basicDetails.schemeShortTitle,
            description: schemeContent.briefDescription,
            detailed_description: schemeContent.detailedDescription,

            // Organization
            ministry: basicDetails.nodalMinistryName?.label,
            department: basicDetails.nodalDepartmentName?.label,
            category: basicDetails.schemeCategory?.[0]?.label,
            sub_category: basicDetails.schemeSubCategory?.map(s => s.label) || [],
            level: basicDetails.level?.label,
            scheme_type: basicDetails.schemeType?.label,

            // Rich content (JSONB)
            benefits: schemeContent.benefits || [],
            eligibility: eligibility.eligibilityDescription || [],
            application_process: langData.applicationProcess || [],
            documents_required: rawScheme.documents || [],
            faqs: rawScheme.faqs || [],

            // Metadata
            tags: basicDetails.tags || [],
            target_beneficiaries: basicDetails.targetBeneficiaries?.map(t => t.label) || [],

            // Dates
            open_date: basicDetails.schemeOpenDate,
            close_date: basicDetails.schemeCloseDate,

            // Contact & links
            application_url: rawScheme.applicationChannels?.[0]?.applicationUrl,
            contact_info: this.extractContactInfo(langData),
            scheme_references: schemeContent.references || [],

            // Geographic coverage
            applicable_states: this.determineStates(basicDetails),
            state: this.determineStates(basicDetails)[0], // Use first state for search/filter

            // Multilingual
            lang: 'en',
            translations: this.extractTranslations(rawScheme),

            // Raw data for reference
            raw_data: rawScheme,

            // Status
            status: 'pending'  // Requires admin approval
        };
    }

    /**
     * Extract contact information
     */
    extractContactInfo(langData) {
        const contacts = {};

        // Extract from various possible locations
        if (langData.schemeContent?.contactInfo) {
            return langData.schemeContent.contactInfo;
        }

        return contacts;
    }

    /**
     * Determine applicable states
     */
    determineStates(basicDetails) {
        if (basicDetails.level?.value === 'central') {
            return ['All India'];
        }

        if (basicDetails.state) {
            return Array.isArray(basicDetails.state)
                ? basicDetails.state
                : [basicDetails.state];
        }

        return ['All India'];
    }

    /**
     * Extract translations
     */
    extractTranslations(rawScheme) {
        const translations = {};

        // Extract all language versions except English
        Object.keys(rawScheme).forEach(key => {
            if (key !== 'en' && key !== '_id' && key !== 'slug' && typeof rawScheme[key] === 'object') {
                translations[key] = rawScheme[key];
            }
        });

        return translations;
    }

    /**
     * Save scheme to database
     */
    async saveScheme(scheme) {
        try {
            // Check if scheme already exists
            const existing = await query(
                'SELECT id FROM schemes WHERE external_id = $1',
                [scheme.external_id]
            );

            if (existing.rows.length > 0) {
                logger.info(`Scheme ${scheme.external_id} already exists, skipping`);
                return 'duplicate';
            }

            // Insert new scheme
            await query(`
                INSERT INTO schemes(
        external_id, slug, title, short_title, description, detailed_description,
        ministry, department, category, sub_category, level, scheme_type,
        benefits, eligibility, application_process, documents_required, faqs,
        tags, target_beneficiaries, open_date, close_date,
        application_url, contact_info, "references", applicable_states, state,
        lang, translations, raw_data, status
    ) VALUES(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
    )
            `, [
                scheme.external_id, scheme.slug, scheme.title, scheme.short_title,
                scheme.description, JSON.stringify(scheme.detailed_description),
                scheme.ministry, scheme.department, scheme.category, JSON.stringify(scheme.sub_category),
                scheme.level, scheme.scheme_type,
                JSON.stringify(scheme.benefits), JSON.stringify(scheme.eligibility),
                JSON.stringify(scheme.application_process), JSON.stringify(scheme.documents_required),
                JSON.stringify(scheme.faqs),
                JSON.stringify(scheme.tags), JSON.stringify(scheme.target_beneficiaries), scheme.open_date, scheme.close_date,
                scheme.application_url, JSON.stringify(scheme.contact_info),
                JSON.stringify(scheme.references), JSON.stringify(scheme.applicable_states), scheme.state,
                scheme.lang, JSON.stringify(scheme.translations),
                JSON.stringify(scheme.raw_data), scheme.status
            ]);

            logger.info(`Saved scheme: ${scheme.title}`);
            return 'success';

        } catch (error) {
            logger.error(`Failed to save scheme ${scheme.external_id}: `, error);
            throw error;
        }
    }

    // ============================================
    // Crawler Job Management
    // ============================================

    async createCrawlerJob() {
        const result = await query(`
            INSERT INTO crawler_jobs(job_type, status, batch_size)
            VALUES($1, $2, $3)
    `, ['schemes', 'running', this.batchSize]);

        return result.lastID;
    }

    async updateJobProgress(jobId, progress) {
        await query(`
            UPDATE crawler_jobs
            SET current_batch = $1, total_fetched = $2, last_updated = CURRENT_TIMESTAMP
            WHERE id = $3
    `, [progress.current_batch, progress.total_fetched, jobId]);
    }

    async updateJobCounts(jobId, counts) {
        await query(`
            UPDATE crawler_jobs
            SET success_count = $1, failed_count = $2, duplicate_count = $3, last_updated = CURRENT_TIMESTAMP
            WHERE id = $4
    `, [counts.success_count, counts.failed_count, counts.duplicate_count, jobId]);
    }

    async incrementErrorCount(jobId) {
        await query(`
            UPDATE crawler_jobs
            SET error_count = error_count + 1, last_updated = CURRENT_TIMESTAMP
            WHERE id = $1
    `, [jobId]);
    }

    async completeCrawlerJob(jobId, totalFetched) {
        await query(`
            UPDATE crawler_jobs
            SET status = 'completed', completed_at = CURRENT_TIMESTAMP, total_fetched = $1, last_updated = CURRENT_TIMESTAMP
            WHERE id = $2
    `, [totalFetched, jobId]);
    }

    async failCrawlerJob(jobId, errorMessage) {
        await query(`
            UPDATE crawler_jobs
            SET status = 'failed', error_message = $1, completed_at = CURRENT_TIMESTAMP, last_updated = CURRENT_TIMESTAMP
            WHERE id = $2
    `, [errorMessage, jobId]);
    }

    async updateGlobalStatus(isRunning, jobId = null, error = null) {
        await query(`
            UPDATE crawler_status
            SET
                is_running = $1,
                current_job_id = $2,
                last_run_at = CURRENT_TIMESTAMP,
                last_success_at = CASE WHEN $3 IS NULL THEN CURRENT_TIMESTAMP ELSE last_success_at END,
                last_error = $3,
                total_runs = total_runs + 1,
                total_success = CASE WHEN $3 IS NULL THEN total_success + 1 ELSE total_success END,
                total_failures = CASE WHEN $3 IS NOT NULL THEN total_failures + 1 ELSE total_failures END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `, [isRunning ? 1 : 0, jobId, error]);
    }

    // ============================================
    // Control Methods
    // ============================================

    pause() {
        this.isPaused = true;
        logger.info('Crawler paused');
    }

    resume() {
        this.isPaused = false;
        logger.info('Crawler resumed');
    }

    stop() {
        this.isStopped = true;
        logger.info('Crawler stopped');
    }
}

module.exports = SchemesCrawler;
