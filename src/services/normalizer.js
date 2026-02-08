// Data normalizer service
// Converts raw scraped data into standardized format

class Normalizer {
    // Normalize scheme data
    static normalizeScheme(rawData, state) {
        return {
            title: this.cleanText(rawData.title || rawData.name),
            description: this.cleanText(rawData.description || rawData.details),
            state: state || rawData.state || 'Central',
            region: rawData.region || this.inferRegion(state),
            category: rawData.category || 'General',
            ministry: rawData.ministry || rawData.department,
            eligibility_criteria: this.cleanText(rawData.eligibility || rawData.eligibility_criteria),
            start_date: this.parseDate(rawData.start_date || rawData.startDate),
            end_date: this.parseDate(rawData.end_date || rawData.endDate || rawData.deadline),
            documents_required: this.cleanText(rawData.documents || rawData.documents_required),
            source_url: rawData.url || rawData.link || rawData.source_url,
            source_website: rawData.source_website || this.extractDomain(rawData.url)
        };
    }

    // Normalize tender data
    static normalizeTender(rawData, state) {
        return {
            tender_name: this.cleanText(rawData.tender_name || rawData.title || rawData.name),
            tender_id: rawData.tender_id || rawData.id || rawData.reference_no,
            reference_number: rawData.reference_number || rawData.ref_no,
            state: state || rawData.state || 'Central',
            department: rawData.department || rawData.organization,
            ministry: rawData.ministry,
            tender_type: rawData.tender_type || rawData.type || 'Open Tender',
            published_date: this.parseDate(rawData.published_date || rawData.publishedDate),
            opening_date: this.parseDate(rawData.opening_date || rawData.openingDate),
            closing_date: this.parseDate(rawData.closing_date || rawData.closingDate || rawData.deadline),
            description: this.cleanText(rawData.description || rawData.details),
            documents_required: this.cleanText(rawData.documents || rawData.documents_required),
            fee_details: rawData.fee_details || rawData.fee,
            source_url: rawData.url || rawData.link || rawData.source_url,
            source_website: rawData.source_website || this.extractDomain(rawData.url)
        };
    }

    // Normalize recruitment data
    static normalizeRecruitment(rawData, state) {
        return {
            post_name: this.cleanText(rawData.post_name || rawData.post || rawData.title),
            organization: rawData.organization || rawData.dept || rawData.department,
            state: state || rawData.state || 'Central',
            ministry: rawData.ministry,
            qualification: this.cleanText(rawData.qualification || rawData.qualifications),
            vacancy_count: parseInt(rawData.vacancy_count || rawData.vacancies || 0),
            application_start_date: this.parseDate(rawData.application_start_date || rawData.startDate),
            application_end_date: this.parseDate(rawData.application_end_date || rawData.endDate || rawData.deadline),
            age_limit: rawData.age_limit || rawData.age,
            selection_process: this.cleanText(rawData.selection_process || rawData.process),
            application_fee: rawData.application_fee || rawData.fee,
            documents_required: this.cleanText(rawData.documents || rawData.documents_required),
            official_notification_link: rawData.notification_link || rawData.notification,
            source_url: rawData.url || rawData.link || rawData.source_url,
            source_website: rawData.source_website || this.extractDomain(rawData.url)
        };
    }

    // Helper: Clean text (remove extra whitespace, HTML tags)
    static cleanText(text) {
        if (!text) return null;
        return text
            .toString()
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
    }

    // Helper: Parse date
    static parseDate(dateStr) {
        if (!dateStr) return null;

        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
        } catch (error) {
            return null;
        }
    }

    // Helper: Extract domain from URL
    static extractDomain(url) {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (error) {
            return null;
        }
    }

    // Helper: Infer region from state
    static inferRegion(state) {
        if (!state || state === 'Central') return 'National';
        return 'State';
    }
}

module.exports = Normalizer;
