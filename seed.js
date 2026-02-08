import { getDb } from './src/database/db.js';

async function seed() {
    const db = await getDb();

    // Seed Schemes
    const schemes = [
        {
            title: 'PM Kisan Samman Nidhi',
            description: 'Direct income support of Rs. 6,000 per year to farmers.',
            state: 'Central',
            region: 'National',
            category: 'Agriculture',
            eligibility_criteria: 'Small and marginal farmers.',
            start_date: '2019-02-24',
            end_date: '2026-12-31',
            documents_required: 'Aadhaar, Bank Account, Land Records',
            source_url: 'https://pmkisan.gov.in/'
        },
        {
            title: 'Maharashtra Scholarship Scheme',
            description: 'Scholarship for students in higher education.',
            state: 'Maharashtra',
            region: 'State',
            category: 'Education',
            eligibility_criteria: 'Domicile of Maharashtra, Family income limit.',
            start_date: '2023-01-01',
            end_date: '2025-12-31',
            documents_required: 'Caste Certificate, Income Certificate, Markshet',
            source_url: 'https://mahadbt.maharashtra.gov.in/'
        },
        {
            title: 'UP Pension Scheme',
            description: 'Old age pension for senior citizens.',
            state: 'Uttar Pradesh',
            region: 'State',
            category: 'Social Welfare',
            eligibility_criteria: 'Age 60+, Below poverty line.',
            start_date: '2022-01-01',
            end_date: '2027-12-31',
            documents_required: 'Aadhaar, Age Proof, Bank Passbook',
            source_url: 'https://sspy-up.gov.in/'
        }
    ];

    for (const s of schemes) {
        await db.run(`
            INSERT INTO schemes (title, description, state, region, category, eligibility_criteria, start_date, end_date, documents_required, source_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [s.title, s.description, s.state, s.region, s.category, s.eligibility_criteria, s.start_date, s.end_date, s.documents_required, s.source_url]);
    }

    // Seed Tenders
    const tenders = [
        {
            tender_name: 'Highway Construction Project',
            tender_id: 'TND-2023-001',
            reference_number: 'REF-MH-01',
            state: 'Maharashtra',
            department: 'PWD',
            tender_type: 'Open Tender',
            published_date: '2023-10-01',
            opening_date: '2023-10-15',
            closing_date: '2023-11-15',
            description: 'Construction of 4-lane highway from Mumbai to Pune.',
            documents_required: 'GST Registration, PAN, Experience Certificate',
            fee_details: 'Rs. 10,000',
            source_url: 'https://etenders.gov.in/'
        },
        {
            tender_name: 'Smart City IT Infrastructure',
            tender_id: 'TND-2023-002',
            reference_number: 'REF-GJ-02',
            state: 'Gujarat',
            department: 'Smart City Cell',
            tender_type: 'E-Tender',
            published_date: '2023-10-05',
            opening_date: '2023-10-20',
            closing_date: '2023-11-20',
            description: 'Implementation of high-speed fiber network.',
            documents_required: 'Technical Spec, Financial Proposal',
            fee_details: 'Rs. 50,000',
            source_url: 'https://gui-etenders.gov.in/'
        }
    ];

    for (const t of tenders) {
        await db.run(`
            INSERT INTO tenders (tender_name, tender_id, reference_number, state, department, tender_type, published_date, opening_date, closing_date, description, documents_required, fee_details, source_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [t.tender_name, t.tender_id, t.reference_number, t.state, t.department, t.tender_type, t.published_date, t.opening_date, t.closing_date, t.description, t.documents_required, t.fee_details, t.source_url]);
    }

    // Seed Recruitments
    const recruitments = [
        {
            post_name: 'Assistant Engineer',
            organization: 'KPSC',
            state: 'Karnataka',
            qualification: 'B.E (Civil)',
            vacancy_count: 50,
            application_start_date: '2023-11-01',
            application_end_date: '2023-12-01',
            age_limit: '18-35 years',
            selection_process: 'Written Exam + Interview',
            application_fee: 'Rs. 500',
            documents_required: 'Degree Certificate, Caste Certificate',
            source_url: 'https://kpsc.kar.nic.in/'
        },
        {
            post_name: 'Police Sub-Inspector',
            organization: 'Tamil Nadu Uniformed Services Recruitment Board',
            state: 'Tamil Nadu',
            qualification: 'Any Degree',
            vacancy_count: 200,
            application_start_date: '2023-10-15',
            application_end_date: '2023-11-15',
            age_limit: '20-30 years',
            selection_process: 'Physical Test + Written Exam',
            application_fee: 'Rs. 500',
            documents_required: '10th, 12th, Degree Marksheets',
            source_url: 'https://tnusrb.tn.gov.in/'
        }
    ];

    for (const r of recruitments) {
        await db.run(`
            INSERT INTO recruitments (post_name, organization, state, qualification, vacancy_count, application_start_date, application_end_date, age_limit, selection_process, application_fee, documents_required, source_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [r.post_name, r.organization, r.state, r.qualification, r.vacancy_count, r.application_start_date, r.application_end_date, r.age_limit, r.selection_process, r.application_fee, r.documents_required, r.source_url]);
    }

    console.log('Database seeded successfully!');
}

seed().catch(err => {
    console.error('Seeding failed:', err);
});
