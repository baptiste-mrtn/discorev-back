INSERT INTO tags (category_id, name, slug)
VALUES (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'type-organisation'
        ),
        'Startup',
        'startup'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'type-organisation'
        ),
        'PME',
        'pme'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'type-organisation'
        ),
        'Grand groupe',
        'grand-groupe'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'modele-activite'
        ),
        'B2B',
        'b2b'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'modele-activite'
        ),
        'B2C',
        'b2c'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'modele-activite'
        ),
        'SaaS',
        'saas'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'modele-activite'
        ),
        'Marketplace',
        'marketplace'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'valeurs-culture'
        ),
        'Innovation',
        'innovation'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'valeurs-culture'
        ),
        'Écologie',
        'ecologie'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'valeurs-culture'
        ),
        'Inclusion',
        'inclusion'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'valeurs-culture'
        ),
        'Bienveillance',
        'bienveillance'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'criteres-selection'
        ),
        'Expérience',
        'experience'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'criteres-selection'
        ),
        'Soft skills',
        'soft-skills'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'criteres-selection'
        ),
        'Diplôme',
        'diplome'
    ),
    (
        (
            SELECT id
            FROM tag_categories
            WHERE slug = 'criteres-selection'
        ),
        'Motivation',
        'motivation'
    ) ON DUPLICATE KEY
UPDATE name =
VALUES(name);