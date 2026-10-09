<?php
/**
 * Plugin Name: Karma Beauty Demo Catalog
 * Description: Imports 20 sample products with unique images. Refreshes images and draft details on marked demo products only. Demo products cannot be purchased.
 * Version: 1.6.0
 * Requires PHP: 8.0
 * Requires Plugins: woocommerce
 * License: GPL-2.0-or-later
 */
defined('ABSPATH') || exit;

function karma_demo_update_details($product, $item) {
    $product->update_meta_data('_karma_ingredients', array_map('sanitize_text_field', $item['ingredients'] ?? array()));
    $product->update_meta_data('_karma_directions', array_map('sanitize_text_field', $item['directions'] ?? array()));
}

add_filter('woocommerce_product_tabs', function ($tabs) {
    global $product;
    if (!$product || $product->get_meta('_karma_demo') !== 'yes') { return $tabs; }
    if (!$product->get_meta('_karma_ingredients') && !$product->get_meta('_karma_directions')) { return $tabs; }
    $tabs['karma_demo_details'] = array('title' => 'المكونات وطريقة الاستخدام', 'priority' => 15, 'callback' => function () {
        global $product;
        echo '<p>بيانات مبدئية للمعاينة: المكونات أمثلة مقترحة وليست تركيبة فعلية معتمدة. تُستبدل بقائمة العبوة وتعليمات المُصنّع قبل البيع.</p>';
        $ingredients = $product->get_meta('_karma_ingredients');
        $directions = $product->get_meta('_karma_directions');
        if (is_array($ingredients) && $ingredients) { echo '<h2>المكونات</h2><p>' . esc_html(implode(' · ', $ingredients)) . '</p>'; }
        if (is_array($directions) && $directions) {
            echo '<h2>طريقة الاستخدام</h2><ol>';
            foreach ($directions as $step) { echo '<li>' . esc_html($step) . '</li>'; }
            echo '</ol>';
        }
    });
    return $tabs;
});

add_action('admin_menu', function () {
    add_submenu_page('woocommerce', 'منتجات كارما التجريبية', 'منتجات كارما التجريبية', 'manage_woocommerce', 'karma-demo', 'karma_demo_admin');
});

function karma_demo_admin() {
    if (!current_user_can('manage_woocommerce')) { return; }
    echo '<div class="wrap"><h1>Karma Beauty — المنتجات الافتراضية</h1><p>استيراد 20 منتجًا للعرض بصور افتراضية. المنتجات مميزة بوسم «تجريبي» ولا تقبل الشراء الحقيقي. لا يكرر الاستيراد المنتجات، ويحدّث الصور والمكونات وطريقة الاستخدام للمنتجات الموسومة كتجريبية؛ لا يعدّل المنتجات الحقيقية.</p>';
    if (isset($_GET['imported'])) { echo '<div class="notice notice-success"><p>اكتمل الاستيراد. أضيف أو حُدثت صور ' . esc_html(absint($_GET['imported'])) . ' منتجًا.</p></div>'; }
    echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '"><input type="hidden" name="action" value="karma_import_demo">';
    wp_nonce_field('karma_import_demo');
    submit_button('استيراد المنتجات التجريبية');
    echo '</form><p>قبل الإطلاق: احذف المنتجات التجريبية وأضف المنتجات الحقيقية بصورها وأسعارها ومخزونها. تأكد من نشر سياسات الشحن والاسترجاع ووسائل التواصل.</p></div>';
}

add_action('admin_post_karma_import_demo', function () {
    if (!current_user_can('manage_woocommerce')) { wp_die('غير مصرح'); }
    check_admin_referer('karma_import_demo');
    if (!class_exists('WC_Product_Simple')) { wp_die('فعّل WooCommerce أولًا.'); }
    $base = get_template_directory() . '/assets/';
    if (!is_readable($base . 'products.json')) { wp_die('فعّل قالب Karma Beauty أولًا.'); }
    $items = json_decode(file_get_contents($base . 'products.json'), true);
    if (!is_array($items)) { wp_die('تعذر قراءة بيانات المنتجات.'); }
    usort($items, function ($a, $b) { return ($a['displayOrder'] ?? 99) <=> ($b['displayOrder'] ?? 99); });
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $categories = array();
    foreach (array('skin' => 'العناية بالبشرة', 'makeup' => 'المكياج', 'hair' => 'العناية بالشعر', 'body' => 'الجسم والاستحمام') as $slug => $name) {
        $term = get_term_by('slug', $slug, 'product_cat');
        if ($term) { $categories[$slug] = $term->term_id; } else { $added = wp_insert_term($name, 'product_cat', array('slug' => $slug)); if (!is_wp_error($added)) { $categories[$slug] = $added['term_id']; } }
    }
    $uploads = wp_upload_dir();
    if (!empty($uploads['error'])) { wp_die(esc_html($uploads['error'])); }
    $images = array();
    foreach (array_unique(array_column($items, 'image')) as $image) {
        if (!is_string($image) || !preg_match('~^[a-z0-9/-]+$~', $image)) { continue; }
        $existing = get_posts(array('post_type' => 'attachment', 'post_status' => 'inherit', 'meta_key' => '_karma_asset', 'meta_value' => $image, 'posts_per_page' => 1, 'fields' => 'ids'));
        if ($existing) { $images[$image] = $existing[0]; continue; }
        $source = $base . $image . '.webp';
        if (!is_readable($source)) { continue; }
        $filename = wp_unique_filename($uploads['path'], 'karma-' . str_replace('/', '-', $image) . '.webp');
        $destination = trailingslashit($uploads['path']) . $filename;
        if (!copy($source, $destination)) { continue; }
        $attachment = wp_insert_attachment(array('post_mime_type' => 'image/webp', 'post_title' => 'Karma Beauty ' . $image, 'post_status' => 'inherit'), $destination, 0, true);
        if (is_wp_error($attachment)) { continue; }
        wp_update_attachment_metadata($attachment, wp_generate_attachment_metadata($attachment, $destination));
        update_post_meta($attachment, '_karma_asset', $image);
        update_post_meta($attachment, '_wp_attachment_image_alt', 'عبوة كارما افتراضية — ' . $image);
        $images[$image] = $attachment;
    }
    $count = 0;
    foreach ($items as $index => $item) {
        $sku = 'KARMA-DEMO-' . str_pad((string) $item['id'], 3, '0', STR_PAD_LEFT);
        $existing_id = wc_get_product_id_by_sku($sku);
        if ($existing_id) {
            $existing_product = wc_get_product($existing_id);
            if ($existing_product && $existing_product->get_meta('_karma_demo') === 'yes' && isset($images[$item['image']])) {
                $existing_product->set_image_id($images[$item['image']]);
                $existing_product->set_menu_order($index);
                $existing_product->set_featured($index < 8);
                karma_demo_update_details($existing_product, $item);
                $existing_product->save();
                $count++;
            }
            continue;
        }
        $product = new WC_Product_Simple();
        $product->set_name($item['name']);
        $product->set_sku($sku);
        $product->set_status('publish');
        $product->set_catalog_visibility('visible');
        $product->set_regular_price((string) ($item['old'] ?? $item['price']));
        if (isset($item['old'])) { $product->set_sale_price((string) $item['price']); }
        $product->set_short_description(($item['description'] ?? 'منتج افتراضي لاستعراض تصميم Karma Beauty.') . ' — نموذج تجريبي غير متاح للشراء.');
        $product->set_description('هذا المنتج والصور والأسعار للمعاينة فقط. يجب استبدال بياناته ببيانات منتج حقيقي قبل البيع.');
        $product->set_category_ids(array($categories[$item['category']] ?? 0));
        $product->set_manage_stock(true);
        $product->set_stock_quantity(25);
        $product->set_featured($index < 8);
        $product->set_menu_order($index);
        if (isset($images[$item['image']])) { $product->set_image_id($images[$item['image']]); }
        $product->update_meta_data('_karma_english_name', $item['en']);
        $product->update_meta_data('_karma_size', $item['size']);
        $product->update_meta_data('_karma_demo', 'yes');
        karma_demo_update_details($product, $item);
        $product->save();
        $count++;
    }
    wp_safe_redirect(add_query_arg(array('page' => 'karma-demo', 'imported' => $count), admin_url('admin.php')));
    exit;
});

// Both classic and Store API checkout rely on product purchasability.
add_filter('woocommerce_is_purchasable', function ($purchasable, $product) {
    return $product->get_meta('_karma_demo') === 'yes' ? false : $purchasable;
}, 10, 2);
add_filter('woocommerce_variation_is_purchasable', function ($purchasable, $product) {
    $parent = wc_get_product($product->get_parent_id());
    return $parent && $parent->get_meta('_karma_demo') === 'yes' ? false : $purchasable;
}, 10, 2);
