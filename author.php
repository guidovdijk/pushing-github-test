<?php get_header(); ?>
    <section role="main">

        <header>

            <?php the_post(); ?>

            <h1><?php _e('Author Archives', 'my-theme'); ?>

                : <?php the_author_link(); ?>
                
            </h1>

            <?php if ('' != get_the_author_meta('user_description')) echo apply_filters('archive_meta', '<div>' . get_the_author_meta('user_description') . '</div>'); ?>
            
            <?php rewind_posts(); ?>

        </header>

        <?php while (have_posts()) : the_post(); ?>

            <?php get_template_part('entry'); ?>

        <?php endwhile; ?>

        <?php get_template_part('nav', 'below'); ?>

    </section>

<?php get_sidebar(); ?>

<?php get_footer(); ?>