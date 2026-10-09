<?php
defined('ABSPATH') || exit;

// The storefront defaults to English; a language choice is kept in a cookie.
add_filter('locale', function ($locale) {
    if (is_admin()) { return $locale; }
    return isset($_COOKIE['karma_language']) && $_COOKIE['karma_language'] === 'ar' ? 'ar' : 'en_US';
});

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
    add_theme_support('html5', array('search-form', 'gallery', 'caption', 'style', 'script'));
    register_nav_menus(array('primary' => 'القائمة الرئيسية'));
});

function karma_product_catalog() {
    if (!function_exists('wc_get_products')) { return array(); }
    $result = array();
    $items = wc_get_products(array('status' => 'publish', 'limit' => 24, 'orderby' => 'menu_order', 'order' => 'ASC', 'visibility' => 'visible'));
    foreach ($items as $product) {
        if (!$product->is_visible()) { continue; }
        $terms = wp_get_post_terms($product->get_id(), 'product_cat', array('fields' => 'slugs'));
        $terms = is_wp_error($terms) ? array() : $terms;
        $price = (float) wc_get_price_to_display($product);
        $regular = $product->get_regular_price();
        $result[] = array(
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'en' => $product->get_meta('_karma_english_name') ?: 'KARMA BEAUTY',
            'price' => $price,
            'old' => $regular !== '' ? (float) wc_get_price_to_display($product, array('price' => $regular)) : 0,
            'category' => $terms[0] ?? 'all',
            'categories' => $terms,
            'imageUrl' => wp_get_attachment_image_url($product->get_image_id(), 'woocommerce_single') ?: wc_placeholder_img_src(),
            'badge' => $product->is_on_sale() ? 'عرض خاص' : ($product->is_featured() ? 'اختيار كارما' : ''),
            'size' => $product->get_meta('_karma_size'),
            'url' => $product->get_permalink(),
            'type' => $product->get_type(),
            'purchasable' => $product->is_purchasable() && $product->is_in_stock(),
            'demo' => $product->get_meta('_karma_demo') === 'yes',
        );
    }
    return $result;
}

add_action('wp_enqueue_scripts', function () {
    $uri = get_template_directory_uri();
    wp_enqueue_style('karma-beauty', $uri . '/assets/style.css', array(), '1.8.2');
    wp_enqueue_style('karma-refinement', $uri . '/assets/refinement.css', array('karma-beauty'), '1.8.2');
    wp_enqueue_script('karma-i18n', $uri . '/assets/i18n.js', array(), '1.8.2', true);
    wp_enqueue_script('karma-beauty', $uri . '/assets/app.js', array('karma-i18n'), '1.8.2', true);
    $catalog = karma_product_catalog();
    $category_urls = array();
    foreach (array('skin', 'makeup', 'hair', 'body') as $slug) {
        $term = get_term_by('slug', $slug, 'product_cat');
        if ($term) { $url = get_term_link($term); if (!is_wp_error($url)) { $category_urls[$slug] = $url; } }
    }
    $policies = array();
    foreach (array('shipping', 'returns', 'privacy', 'contact') as $slug) {
        $page = get_page_by_path($slug);
        if ($page) { $policies[$slug] = get_permalink($page); }
    }
    $wc = function_exists('WC');
    wp_localize_script('karma-i18n', 'KARMA_CONFIG', array(
        'mode' => 'woocommerce',
        'assets' => $uri . '/assets',
        'products' => is_front_page() ? $catalog : array(),
        'homeUrl' => home_url('/'),
        'shopUrl' => $wc ? wc_get_page_permalink('shop') : home_url('/'),
        'cartUrl' => $wc ? wc_get_cart_url() : home_url('/'),
        'accountUrl' => $wc ? wc_get_page_permalink('myaccount') : home_url('/'),
        'checkoutUrl' => $wc ? wc_get_checkout_url() : home_url('/'),
        'addToCartUrl' => $wc ? WC_AJAX::get_endpoint('add_to_cart') : '',
        'cartCount' => $wc && WC()->cart ? WC()->cart->get_cart_contents_count() : 0,
        'categoryUrls' => $category_urls,
        'policies' => $policies,
        'storeContent' => json_decode(file_get_contents(get_template_directory() . '/assets/store-content.json'), true),
        'translations' => json_decode(file_get_contents(get_template_directory() . '/assets/translations/en.json'), true),
        'contact' => array('phone' => get_theme_mod('karma_phone', '+20 10 18239900'), 'whatsapp' => get_theme_mod('karma_whatsapp', '+20 10 18239900'), 'email' => get_theme_mod('karma_email', ''), 'demo' => (bool) get_theme_mod('karma_contact_demo', false)),
        'currencyLabel' => $wc && get_woocommerce_currency() !== 'EGP' ? get_woocommerce_currency() : 'ج.م.',
        'hasDemoProducts' => count(array_filter($catalog, function ($p) { return $p['demo']; })) > 0,
    ));
    if ($wc) { wp_enqueue_script('wc-cart-fragments'); }
});

add_filter('woocommerce_add_to_cart_fragments', function ($fragments) {
    $count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
    $fragments['.header-tools [data-cart-count]'] = '<span class="cart-count" data-cart-count>' . esc_html($count) . '</span>';
    return $fragments;
});

add_action('wp_head', function () {
    echo '<link rel="icon" type="image/svg+xml" href="' . esc_url(get_template_directory_uri() . '/assets/favicon.svg') . '">';
    echo '<meta name="theme-color" content="#ce3279">';
});

add_action('customize_register', function ($customizer) {
    $customizer->add_section('karma_identity', array('title' => 'Karma Beauty — الرئيسية', 'priority' => 30));
    $customizer->add_setting('karma_announcement_enabled', array('default' => true, 'sanitize_callback' => 'rest_sanitize_boolean'));
    $customizer->add_control('karma_announcement_enabled', array('label' => 'إظهار شريط العروض أعلى الموقع', 'section' => 'karma_identity', 'type' => 'checkbox'));
    $fields = array(
        'karma_title_one' => array('العنوان — السطر الأول', 'جمالك.'),
        'karma_title_two' => array('العنوان — السطر الثاني', 'على طبيعتك.'),
        'karma_intro' => array('وصف البانر', 'تفاصيل صغيرة، إحساس مختلف. اكتشفي عالمًا من العناية والألوان، يشبهك إنتِ.'),
        'karma_announcement' => array('الشريط العلوي', 'عروض كارما'),
    );
    foreach ($fields as $key => $field) {
        $customizer->add_setting($key, array('default' => $field[1], 'sanitize_callback' => 'sanitize_text_field'));
        $customizer->add_control($key, array('label' => $field[0], 'section' => 'karma_identity', 'type' => 'text'));
    }
    $customizer->add_setting('karma_hero_image', array('sanitize_callback' => 'esc_url_raw'));
    $customizer->add_control(new WP_Customize_Image_Control($customizer, 'karma_hero_image', array('label' => 'صورة البانر الرئيسي', 'section' => 'karma_identity')));
    $customizer->add_section('karma_contact', array('title' => 'Karma Beauty — التواصل', 'priority' => 31));
    foreach (array('karma_phone' => array('رقم الاتصال', '+20 10 18239900'), 'karma_whatsapp' => array('رقم واتساب', '+20 10 18239900'), 'karma_email' => array('البريد الإلكتروني', '')) as $key => $field) {
        $customizer->add_setting($key, array('default' => $field[1], 'sanitize_callback' => $key === 'karma_email' ? 'sanitize_email' : 'sanitize_text_field'));
        $customizer->add_control($key, array('label' => $field[0], 'section' => 'karma_contact', 'type' => 'text'));
    }
    $customizer->add_setting('karma_contact_demo', array('default' => false, 'sanitize_callback' => 'rest_sanitize_boolean'));
    $customizer->add_control('karma_contact_demo', array('label' => 'بيانات تجريبية — لا تفتح اتصالًا حقيقيًا (ألغِه بعد إدخال بياناتك)', 'section' => 'karma_contact', 'type' => 'checkbox'));
});

add_action('admin_notices', function () {
    if (current_user_can('activate_plugins') && !class_exists('WooCommerce')) {
        echo '<div class="notice notice-warning"><p>قالب Karma Beauty يحتاج تفعيل WooCommerce لتشغيل المنتجات والسلة والدفع.</p></div>';
    }
});
