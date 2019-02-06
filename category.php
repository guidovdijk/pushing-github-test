<?php get_header(); ?>

    <section role="main">

        <header>

            <h1>

                <?php _e('Category Archives: ', 'my_theme'); ?>

                <?php single_cat_title(); ?>

            </h1>

            <?php if ('' != category_description()) echo apply_filters('archive_meta', '<div>' . category_description() . '</div>'); ?>
        
        </header>

        <?php if (have_posts()) : while (have_posts()) : the_post(); ?>

            <?php get_template_part('entry'); ?>

        <?php endwhile; endif; ?>

        <?php get_template_part('nav', 'below'); ?>

    </section>

<?php get_sidebar(); ?>

<?php get_footer(); ?>
