
export interface Job {
    id: string;
    user_id: string;
    title: string;
    company_name: string;
    location: string;
    type: string;
    salary_range?: string;
    description: string;
    created_at: string;
    category_id?: string;
    phone?: string;
    email?: string;
    job_type?: string;
    experience_level?: string;
    seo_url?: string;
    is_active: boolean;
}

export interface Category {
    id: string;
    name_ar: string;
    name_en: string;
    icon?: string;
}

export interface Profile {
    id: string;
    user_id: string;
    full_name: string;
    title?: string;
    bio?: string;
    category_id?: string;
    skills?: string[];
    cv_url?: string;
    phone?: string;
    email?: string;
    city?: string;
    created_at: string;
}
