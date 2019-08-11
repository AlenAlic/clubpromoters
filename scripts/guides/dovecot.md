# Manual dovecot configuration

Follow these steps after having completed `scripts/guides/postfix`

# /etc/dovecot/dovecot.conf

    sudo nano /etc/dovecot/dovecot.conf

Add

    protocols = imap pop3 lmtp
    postmaster_address=postmaster at example.com

Uncomment

    listen = *, ::

Save changes

# /etc/dovecot/conf.d/10-mail.conf

    sudo nano /etc/dovecot/conf.d/10-mail.conf

Add

    mail_location = maildir:/var/mail/vhosts/%d/%n/
    mail_privileged_group = mail

Save changes

# Add virtual hosts/user

    sudo mkdir -p /var/mail/vhosts/alenalic.nl
    sudo groupadd -g 5000 vmail
    sudo useradd -g vmail -u 5000 vmail -d /var/mail
    sudo chown -R vmail:vmail /var/mail

# /etc/dovecot/conf.d/10-auth.conf

    sudo nano /etc/dovecot/conf.d/10-auth.conf

Uncomment

    disable_plaintext_auth = yes

Change

    auth_mechanisms = plain login

Uncomment

    !include auth-system.conf.ext
    !include auth-sql.conf.ext

# /etc/dovecot/conf.d/auth-sql.conf.ext

    sudo nano /etc/dovecot/conf.d/auth-sql.conf.ext

Change

    passdb {
        driver = sql
        args = /etc/dovecot/dovecot-sql.conf.ext
    }

Comment

    #userdb {
    #  driver = sql
    #  args = /etc/dovecot/dovecot-sql.conf.ext
    #}

Change

    userdb {
        driver = static
        args = uid=vmail gid=vmail home=/var/mail/vhosts/%d/%n
    }

Save changes

# Change directory owner/permissions

    sudo chown -R vmail:dovecot /etc/dovecot
    sudo chmod -R o-rwx /etc/dovecot

# /etc/dovecot/conf.d/10-master.conf

    sudo nano /etc/dovecot/conf.d/10-master.conf

Change

    ...
    service imap-login {
        inet_listener imap {
            port = 0
        }
        inet_listener imaps {
            port = 993
            ssl = yes
        }
        ...
    }
    ...
    service pop3-login {
        inet_listener pop3 {
            port = 0
    }
        inet_listener pop3s {
            port = 995
            ssl = yes
        }
    }
    ...
    service lmtp {
        unix_listener /var/spool/postfix/private/dovecot-lmtp {
            mode = 0600
            user = postfix
            group = postfix
        }
    ...
    }
    service auth {
        ...
        unix_listener /var/spool/postfix/private/auth {
            mode = 0660
            user = postfix
            group = postfix
        }

        unix_listener auth-userdb {
            mode = 0600
            user = vmail
        }
        ...
        user = dovecot
    }
    ...
    service auth-worker {
        ...
        user = vmail
    }
    ...

Save changes

# /etc/dovecot/conf.d/10-ssl.conf

    sudo nano /etc/dovecot/conf.d/10-ssl.conf

Change

    ssl_cert = </etc/letsencrypt/live/alenalic.nl/fullchain.pem
    ssl_key = </etc/letsencrypt/live/alenalic.nl/privkey.pem

# Restart dovecot

    sudo systemctl restart dovecot

# Continue

Continue by running `scripts/dkim`
