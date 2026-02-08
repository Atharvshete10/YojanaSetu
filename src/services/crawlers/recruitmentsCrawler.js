const BaseCrawler = require('./BaseCrawler');
const Normalizer = require('../normalizer');
const logger = require('../logger');

class RecruitmentsCrawler extends BaseCrawler {
    constructor(source) {
        super(source);
    }

    // Crawl recruitments for a specific state
    async crawlState(state) {
        try {
            // National Career Service or state PSC URLs
            let url;

            if (state === 'Central') {
                url = `${this.source.url}jobs?location=All+India`;
            } else {
                url = `${this.source.url}jobs?location=${encodeURIComponent(state)}`;
            }

            logger.debug(`Fetching recruitments for ${state} from ${url}`);

            const html = await this.fetch(url);
            return this.parseHTMLResponse(html, state);

        } catch (error) {
            logger.error(`Error crawling recruitments for ${state}:`, error);
            return [];
        }
    }

    // Parse HTML response
    parseHTMLResponse(html, state) {
        try {
            const $ = this.parseHTML(html);
            const recruitments = [];

            // Example selectors - adjust based on actual website structure
            $('.job-item, .recruitment-card, .vacancy-row, table.job-list tr').each((i, element) => {
                if (i === 0) return; // Skip header if table

                const $el = $(element);

                recruitments.push({
                    post_name: $el.find('.post-name, .job-title, h3, td:eq(0)').first().text().trim(),
                    organization: $el.find('.organization, .department, td:eq(1)').text().trim(),
                    state: state,
                    qualification: $el.find('.qualification, .eligibility').text().trim(),
                    vacancies: $el.find('.vacancies, .vacancy-count, td:eq(2)').text().trim(),
                    application_start_date: $el.find('.start-date').text().trim(),
                    application_end_date: $el.find('.end-date, .deadline, .last-date, td:eq(3)').text().trim(),
                    age_limit: $el.find('.age-limit, .age').text().trim(),
                    selection_process: $el.find('.selection-process, .process').text().trim(),
                    fee: $el.find('.application-fee, .fee').text().trim(),
                    documents: $el.find('.documents-required').text().trim(),
                    notification_link: $el.find('.notification-link, a.notification').attr('href'),
                    url: $el.find('a').first().attr('href'),
                    source_website: this.source.url
                });
            });

            return recruitments.filter(r => r.post_name); // Filter out empty entries

        } catch (error) {
            logger.error('Error parsing HTML response:', error);
            return [];
        }
    }

    // Normalize recruitment data
    normalize(rawData, state) {
        return Normalizer.normalizeRecruitment(rawData, state);
    }
}

module.exports = RecruitmentsCrawler;
