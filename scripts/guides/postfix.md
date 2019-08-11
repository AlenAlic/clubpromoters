# Manual postfix configuration

Follow these steps after having completed `scripts/postfix`

# /etc/postfix/master.cf

Below `# -o milter_macro_daemon_name=ORIGINATING` add

    submission inet n       -       y      -       -       smtpd
        -o syslog_name=postfix/submission
        -o smtpd_tls_security_level=encrypt
        -o smtpd_sasl_auth_enable=yes
        -o smtpd_sasl_type=dovecot
        -o smtpd_sasl_path=private/auth
        -o smtpd_reject_unlisted_recipient=no
        -o smtpd_client_restrictions=permit_sasl_authenticated,reject
        -o milter_macro_daemon_name=ORIGINATING
    smtps     inet  n       -       -       -       -       smtpd
        -o syslog_name=postfix/smtps
        -o smtpd_tls_wrappermode=yes
        -o smtpd_sasl_auth_enable=yes
        -o smtpd_sasl_type=dovecot
        -o smtpd_sasl_path=private/auth
        -o smtpd_client_restrictions=permit_sasl_authenticated,reject
        -o milter_macro_daemon_name=ORIGINATING

Save changes

# Restrict ownership

    sudo chmod -R o-rwx /etc/postfix

Restart postfix

    sudo systemctl restart postfix

# Continue

Continue by following `scripts/guides/dovecot.md`
