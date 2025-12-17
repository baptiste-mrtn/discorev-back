INSERT INTO plans (
        name,
        price_month,
        price_year,
        commitment,
        credits,
        ad_duration_hours,
        features,
        is_active
    )
VALUES (
        "Freemium",
        0,
        0,
        NULL,
        "3 annonces offertes",
        48,
        JSON_ARRAY(
            "3 annonces offertes",
            "Profil & page auto-personnalisés",
            "Dépôt d\'annonces"
        ),
        true
    ),
    (
        "Connect 2",
        29,
        0,
        NULL,
        "2 annonces / mois",
        48,
        JSON_ARRAY(
            "2 annonces / mois",
            "Profil & page auto-personnalisés",
            "Dépôt d\'annonces"
        ),
        true
    ),
    (
        "Connect 4",
        39,
        0,
        NULL,
        "4 annonces / mois",
        48,
        JSON_ARRAY(
            "4 annonces / mois",
            "Profil & page auto-personnalisés",
            "Dépôt d\'annonces"
        ),
        true
    ),
    (
        "Connect +",
        79,
        0,
        NULL,
        "Illimité",
        48,
        JSON_ARRAY(
            "Annonces illimitées (réactivation 30j)",
            "Profil & page auto-personnalisés",
            "Dépôt d\'annonces"
        ),
        true
    ),
    (
        "Premium - Marque Employeur",
        0,
        1890,
        "1 an",
        "Illimité",
        48,
        JSON_ARRAY(
            "Payable en 4 fois - Acompte de 472,5€",
            "Annonces illimitées",
            "Page employeur sur mesure & copywriting",
            "Contenu média : 3 interviews, 10 photos",
            "Audit de marque employeur",
            "Accès prioritaire aux nouvelles features - CVthèque"
        ),
        true
    ) ON DUPLICATE KEY
UPDATE name =
VALUES(name);