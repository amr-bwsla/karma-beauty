<?php defined('ABSPATH') || exit; get_header(); ?>
<main id="main" class="woocommerce-main native-content">
<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
<article><h1><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1><?php if (is_singular()) { the_content(); } else { the_excerpt(); } ?></article>
<?php endwhile; the_posts_pagination(); else : ?>
<h1>لسه مفيش محتوى هنا</h1><a class="button primary" href="<?php echo esc_url(home_url('/')); ?>">العودة للرئيسية</a>
<?php endif; ?>
</main>
<?php get_footer(); ?>
