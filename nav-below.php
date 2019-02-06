<?php global $wp_query; if ( $wp_query->max_num_pages > 1 ) : ?>

    <nav role="navigation">
   
        <div>
        
            <?php next_posts_link(sprintf( __( '%s older', 'my-theme' ), '<span>&larr;</span>' ) ) ?>
        
        </div>
        
        <div>
        
            <?php previous_posts_link(sprintf( __( 'newer %s', 'my-theme' ), '<span>&rarr;</span>' ) ) ?>
        
        </div>

    </nav>

<?php endif; ?>
