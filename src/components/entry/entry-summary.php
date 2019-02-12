<?php the_excerpt(); ?>

<?php if( is_search() ) : ?>

    <div>
    
        <?php wp_link_pages(); ?>
    
    </div>

<?php endif; ?>