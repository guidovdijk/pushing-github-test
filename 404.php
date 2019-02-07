<?php get_header(); ?>

    <section role="main">

        <article>

            <header>

                <h1><?php _e('Not Found', 'my_theme'); ?></h1>

            </header>

            <section>

                <p><?php _e('Nothing found for the requested page. Try a search instead?', 'my_theme'); ?></p>

                <?php get_search_form(); ?>

            </section>

        </article>

    </section>

<?php get_sidebar(); ?>
<?php get_footer(); ?>
