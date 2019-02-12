<article class="article">

    <header class="article__header">

        <a class="article__header__title" href="<?php the_permalink(); ?>" title="<?php the_title_attribute(); ?>" rel="bookmark">
        
            <?php the_title(); ?>
        
        </a>

        <section class="article__content">

            <?php get_template_part('components/entry/entry', 'content'); ?>

        </section>
        

    </header>

    <section class="article__meta">

        <?php get_template_part('components/entry/entry', 'meta'); ?>

    </section>


    <footer class="article__footer">

        <?php get_template_part('components/entry/entry', 'footer'); ?>
    
    </footer> 

</article>