<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>.karma-locale-pending body{visibility:hidden}.karma-announcement-dismissed .announcement{display:none!important}</style>
<script><?php readfile(get_template_directory() . '/assets/boot.js'); ?></script>
<?php wp_head(); ?></head>
<body <?php body_class(); ?>><?php wp_body_open(); ?>
<?php require get_template_directory() . '/template-parts/site-header.php'; ?>
