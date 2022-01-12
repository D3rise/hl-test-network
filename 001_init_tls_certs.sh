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


$ORG0_ADDRESS="0.0.0.0"
$ORG0_PEER="7053"
$ORG0_ADMIN="org0admin:org0adminpw"

fabric-ca-client enroll -u https://$ORG0_ADMIN@$ORG0_ADDRESS:$ORG0_PORT
fabric-ca-client register -u https://$TLS_IP:$TLS_PORT --tls.certfiles $TLS_CERTFILES --id.name orderer1-org0 --id.secret ordererpw --id.type orderer

# TODO: https://hyperledger-fabric-ca.readthedocs.io/en/latest/operations_guide.html#setup-peers
