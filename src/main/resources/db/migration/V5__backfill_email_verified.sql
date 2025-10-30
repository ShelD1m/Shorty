UPDATE users
SET email_verified = TRUE
WHERE COALESCE(email_verified, FALSE) = FALSE;