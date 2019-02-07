<footer>

    <span>

        <?php _e( 'Categories: ', 'my_theme' ); ?><?php the_category( ', ' ); ?>

    </span>

    <span>

        <?php the_tags(); ?>

    </span>

    <?php if ( comments_open() ) { 
        echo '<span>|</span> <span><a href="' . get_comments_link() . '">' . sprintf( __( 'Comments', 'my_theme' ) ) . '</a></span>';
    } ?>

</footer> 
