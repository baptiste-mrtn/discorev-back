INSERT INTO tag_categories (name, slug)
VALUES ('Type d’organisation', 'type-organisation'),
    ('Modèle d’activité', 'modele-activite'),
    ('Valeurs & culture', 'valeurs-culture'),
    ('Critères de sélection', 'criteres-selection') ON DUPLICATE KEY
UPDATE name =
VALUES(name);