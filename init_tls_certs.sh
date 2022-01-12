#!/bin/bash
PATH=$PATH:$PWD/fabric-bin
TLS_CERTFILES="/tmp/hyperledger/ca-tls/ca-cert.pem"
TLS_IP="0.0.0.0"
TLS_PORT="7052"

fabric-ca-client enroll -u https://tlsadmin:tlsadminpw@$TLS_IP:$TLS_PORT --tls.certfiles $TLS_CERTFILES

for i in {1..2}
do
    for j in {1..2}
    do
        fabric-ca-client register -u https://$TLS_IP:$TLS_PORT --tls.certfiles $TLS_CERTFILES --id.name org${i}-peer${j} --id.secret peer${j}pw --id.type peer
    done
done

fabric-ca-client register -u https://$TLS_IP:$TLS_PORT --tls.certfiles $TLS_CERTFILES  --id.name orderer1-org0 --id.secret ordererpw --id.type orderer
