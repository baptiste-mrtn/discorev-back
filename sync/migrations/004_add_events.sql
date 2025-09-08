CREATE EVENT IF NOT EXISTS archive_expired_job_offers
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
    UPDATE job_offers
    SET status = 'archived'
    WHERE expiration_date < CURDATE()
      AND status != 'archived';
