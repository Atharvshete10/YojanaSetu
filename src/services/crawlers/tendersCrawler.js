const BaseCrawler = require('./BaseCrawler');
const Normalizer = require('../normalizer');
const logger = require('../logger');

class TendersCrawler extends BaseCrawler {
    constructor(source) {
        super(source);
    }

    // Crawl tenders for a specific state
    async crawlState(state) {
        try {
            // eProcure.gov.in search URL (example - adjust based on actual website)
            const url = `${this.source.url}eprocure/app?page=FrontEndTendersByOrganisation&service=page&state=${encodeURIComponent(state)}`;

            logger.debug(`Fetching tenders for ${state} from ${url}`);

            const html = await this.fetch(url);
            return this.parseHTMLResponse(html, state);

        } catch (error) {
            logger.error(`Error crawling tenders for ${state}:`, error);
            return [];
        }
    }

    // Parse HTML response
    parseHTMLResponse(html, state) {
        try {
            const $ = this.parseHTML(html);
            const tenders = [];

            // Example selectors - adjust based on actual website structure
            $('table.list_table tr, .tender-row, .tender-item').each((i, element) => {
                if (i === 0) return; // Skip header row

                const $el = $(element);
                const $cells = $el.find('td');

                if ($cells.length === 0) return;

                tenders.push({
                    tender_name: $cells.eq(1).text().trim() || $el.find('.tender-title, h3').text().trim(),
                    tender_id: $cells.eq(0).text().trim() || $el.find('.tender-id').text().trim(),
                    reference_number: $el.find('.ref-no, .reference').text().trim(),
                    state: state,
                    department: $cells.eq(2).text().trim() || $el.find('.department, .organization').text().trim(),
                    tender_type: $el.find('.tender-type, .type').text().trim(),
                    published_date: $cells.eq(3).text().trim(),
                    closing_date: $cells.eq(4).text().trim() || $el.find('.closing-date, .deadline').text().trim(),
                    description: $el.find('.description, .details').text().trim(),
                    fee: $el.find('.fee, .tender-fee').text().trim(),
                    url: $el.find('a').first().attr('href'),
                    source_website: this.source.url
                });
            });

            return tenders.filter(t => t.tender_name); // Filter out empty entries

        } catch (error) {
            logger.error('Error parsing HTML response:', error);
            return [];
        }
    }

    // Normalize tender data
    normalize(rawData, state) {
        return Normalizer.normalizeTender(rawData, state);
    }
}

module.exports = TendersCrawler;
