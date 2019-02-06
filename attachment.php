<?php get_header(); ?>

    <?php global $post; ?>

    <section role="main">

        <?php if (have_posts()) : while (have_posts()) : the_post(); ?>

            <header>

                <h1><?php the_title(); ?> 
                <span>|</span> 
                <a href="<?php echo get_permalink($post->post_parent); ?>"
                   title="<?php printf(__('Return to %s', 'my-theme'), esc_html(get_the_title($post->post_parent), 1)); ?>"
                   rev="attachment">

                   <span>&larr; </span>
                   <?php echo get_the_title($post->post_parent); ?>

                </a>

                </h1> <?php edit_post_link(); ?>

                <?php get_template_part('entry', 'meta'); ?>

            </header>

            <article <?php post_class(); ?>>

                <header>

                    <nav role="navigation">

                        <div><?php previous_image_link(false, '&larr;'); ?></div>

                        <div><?php next_image_link(false, '&rarr;'); ?></div>

                    </nav>

                </header>

                <section>

                    <div>

                        <?php if (wp_attachment_is_image($post->ID)) : $att_image = wp_get_attachment_image_src($post->ID, "large"); ?>
                            <p>
                                <a href="<?php echo wp_get_attachment_url($post->ID); ?>"
                                   title="<?php the_title(); ?>" rel="attachment">
                                    <img src="<?php echo $att_image[0]; ?>" 
                                        width="<?php echo $att_image[1]; ?>"
                                        height="<?php echo $att_image[2]; ?>" 
                                       
                                        alt="<?php $post->post_excerpt; ?>"
                                    />
                                </a>
                            </p>
                        <?php else : ?>

                            <a href="<?php echo wp_get_attachment_url($post->ID); ?>"
                               title="<?php echo esc_html(get_the_title($post->ID), 1); ?>"
                               rel="attachment">
                                <?php echo basename($post->guid); ?>
                            </a>

                        <?php endif; ?>

                    </div>

                    <div><?php if (!empty($post->post_excerpt)) the_excerpt(); ?></div>

                    <?php if (has_post_thumbnail()) {

                        the_post_thumbnail();

                    } ?>

                </section>

            </article>

            <?php comments_template(); ?>

        <?php endwhile; endif; ?>

    </section>

<?php get_sidebar(); ?>

<?php get_footer(); ?>
