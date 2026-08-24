/**
 * قاموس ترجمة وتوضيح أخطاء Supabase والشبكة والنظام إلى اللغة العربية الفصحى
 */
export function getArabicErrorMessage(error: any): string {
    if (!error) return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';

    const message = typeof error === 'string' 
        ? error 
        : error?.message || error?.error_description || error?.error || JSON.stringify(error);

    const lower = message.toLowerCase();

    // 1. أخطاء الاتصال والشبكة وبيئة العمل
    if (
        lower.includes('fetch failed') ||
        lower.includes('failed to fetch') ||
        lower.includes('network') ||
        lower.includes('econnrefused') ||
        lower.includes('enotfound') ||
        lower.includes('xyz.supabase.co') ||
        lower.includes('placeholder')
    ) {
        return 'تعذر الاتصال بقاعدة البيانات (Supabase). يرجى التأكد من ضبط مفاتيح الربط (NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY) في ملف .env.local والتحقق من اتصال الإنترنت.';
    }

    // 2. أخطاء تسجيل الدخول والمصادقة
    if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.';
    }

    if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('user_already_exists')) {
        return 'هذا البريد الإلكتروني مسجل بالفعل. يمكنك تسجيل الدخول مباشرة أو استعادة كلمة المرور.';
    }

    if (lower.includes('password should be at least 6 characters') || lower.includes('password is too short')) {
        return 'يجب أن تتكون كلمة المرور من 6 خانات (أحرف أو أرقام) على الأقل.';
    }

    if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
        return 'يرجى تأكيد بريدك الإلكتروني أولاً من خلال الرابط المرسل إلى صندوق الوارد (أو مجلد الرسائل غير المرغوب فيها Spam).';
    }

    if (lower.includes('invalid email') || lower.includes('unable to validate email address')) {
        return 'صيغة البريد الإلكتروني غير صحيحة. يرجى إدخال بريد إلكتروني صالح مثل name@example.com.';
    }

    if (lower.includes('signup requires a valid password')) {
        return 'يرجى إدخال كلمة مرور صالحة وقوية.';
    }

    if (lower.includes('to signup, please provide your email')) {
        return 'يرجى إدخال عنوان البريد الإلكتروني لإتمام التسجيل.';
    }

    if (lower.includes('user not found')) {
        return 'الحساب غير مسجل لدينا. يرجى التأكد من البريد المدخل أو إنشاء حساب جديد.';
    }

    if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_email_send_rate_limit')) {
        return 'تم تجاوز الحد الأقصى للمحاولات السريعة. يرجى الانتظار دقيقة واحدة ثم المحاولة مرة أخرى.';
    }

    if (lower.includes('jwt expired') || lower.includes('token expired') || lower.includes('session expired')) {
        return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى للمتابعة.';
    }

    if (lower.includes('unauthorized') || lower.includes('not authorized') || lower.includes('forbidden')) {
        return 'يجب تسجيل الدخول أولاً لتنفيذ هذه العملية.';
    }

    // 3. أخطاء قواعد البيانات والتخزين
    if (lower.includes('row-level security') || lower.includes('rls') || lower.includes('violates row-level security')) {
        return 'ليس لديك الصلاحية لتعديل أو نشر هذا العنصر. تأكد من تسجيل دخولك بحسابك الصحيح.';
    }

    if (lower.includes('bucket not found')) {
        return 'مجلد تخزين الملفات غير متوفر في قاعدة البيانات. يرجى تشغيل سكربت الإعداد الشامل supabase_complete_setup.sql.';
    }

    if (lower.includes('duplicate key') || lower.includes('unique constraint')) {
        return 'هذه البيانات مسجلة مسبقاً في النظام ولا يمكن تكرارها.';
    }

    // 4. أخطاء حجم ونوع الملفات
    if (lower.includes('payload too large') || lower.includes('entity too large') || lower.includes('size')) {
        return 'حجم الملف كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.';
    }

    // 5. تفاصيل الخطأ المباشر من قاعدة البيانات
    if (error?.message && error.message !== 'null' && error.message !== '[object Object]') {
        return `خطأ: ${error.message}`;
    }

    if (rawMessage && rawMessage.length > 3 && rawMessage.length < 250 && !rawMessage.includes('{}')) {
        return `خطأ أثناء تنفيذ الطلب: ${rawMessage}`;
    }

    // إذا لم يتطابق أي نمط سابق، إرجاع رسالة عربية واضحة
    return 'حدث خطأ أثناء تنفيذ الطلب. يرجى التأكد من ملء جميع الحقول المطلوبة والمحاولة مرة أخرى.';
}
