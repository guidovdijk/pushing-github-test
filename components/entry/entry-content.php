<section>

    <?php if ( has_post_thumbnail() ) { 

        the_post_thumbnail(); 

    } ?>

    <?php the_content(); ?>

    <div>
    
        <?php wp_link_pages(); ?>
    
    </div>

</section>