#!/bin/bash
# Mails whatever it gets from stdin.

to="jimkang@ghostcrabworkshop.com"
subject="Forever is starting node on $HOSTNAME"
body="Latest log lines:\n";

while read -r line; do
  [[ $line = \#* ]] && continue
  body="$body$line\n"
done < /dev/stdin

echo -e $body | mail -s "$subject" $to

