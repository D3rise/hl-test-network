#!/bin/bash
PATH=$PATH:$PWD/fabric-bin
TLS_CERTFILES="/tmp/hyperledger/ca-tls/ca-cert.pem"
TLS_IP="0.0.0.0"
TLS_PORT="7052"
DATA_DIR=$PWD/data

if [ -d ./data  ]
then
    rm -rf ./data
fi

echo "Enrolling tls admin..."
fabric-ca-client enroll --home $DATA_DIR/tls/ca/admin -u https://tlsadmin:tlsadminpw@$TLS_IP:$TLS_PORT --tls.certfiles $TLS_CERTFILES

for i in {1..2}
do
    for j in {1..2}
    do
        fabric-ca-client register --home $DATA_DIR/tls/ca/admin -u https://$TLS_IP:$TLS_PORT --tls.certfiles $TLS_CERTFILES --id.name org${i}-peer${j} --id.secret peer${j}pw --id.type peer
    done
done

fabric-ca-client register --home $DATA_DIR/tls/ca/admin -u https://$TLS_IP:$TLS_PORT --tls.certfiles $TLS_CERTFILES  --id.name orderer1-org0 --id.secret ordererpw --id.type orderer

ORG0_ADDRESS="0.0.0.0"
ORG0_PORT="7053"
ORG0_ADMIN="org0admin:org0adminpw"
ORG0_CERTFILES="/tmp/hyperledger/ca-org0/ca-cert.pem"

echo "Enrolling orderer..."
fabric-ca-client enroll --home $DATA_DIR/org0/ca/admin -u https://$ORG0_ADMIN@$ORG0_ADDRESS:$ORG0_PORT --tls.certfiles /tmp/hyperledger/ca-org0/ca-cert.pem
fabric-ca-client register --home $DATA_DIR/org0/ca/admin -u https://$ORG0_ADDRESS:$ORG0_PORT --tls.certfiles $ORG0_CERTFILES --id.name orderer1-org0 --id.secret ordererpw --id.type orderer
fabric-ca-client register --home $DATA_DIR/org0/ca/admin -u https://$ORG0_ADDRESS:$ORG0_PORT --tls.certfiles $ORG0_CERTFILES --id.name admin-org0 --id.secret adminpw --id.type admin --id.attrs "hf.Registrar.Roles=client,hf.Registrar.Attributes=*,hf.Revoker=true,hf.GenCRL=true,admin=true:ecert,abac.init=true:ecert"

ORG1_ADDRESS="0.0.0.0"
ORG1_PORT="7054"
ORG1_ADMIN="org1admin:org1adminpw"
ORG1_CERTFILES="/tmp/hyperledger/ca-org1/ca-cert.pem"

echo "Enrolling org1..."

fabric-ca-client enroll --home $DATA_DIR/org1/ca/admin --tls.certfiles $ORG1_CERTFILES -u https://$ORG1_ADMIN@$ORG1_ADDRESS:$ORG1_PORT
fabric-ca-client register --home $DATA_DIR/org1/ca/admin -u https://$ORG1_ADDRESS:$ORG1_PORT --tls.certfiles $ORG1_CERTFILES

fabric-ca-client register --home $DATA_DIR/org1/ca/admin --tls.certfiles $ORG1_CERTFILES --id.name org1-peer1 --id.secret peer1pw --id.type peer -u https://$ORG1_ADDRESS:$ORG1_PORT
fabric-ca-client register --home $DATA_DIR/org1/ca/admin --tls.certfiles $ORG1_CERTFILES --id.name org1-peer2 --id.secret peer2pw --id.type peer -u https://$ORG1_ADDRESS:$ORG1_PORT
fabric-ca-client register --home $DATA_DIR/org1/ca/admin --tls.certfiles $ORG1_CERTFILES --id.name admin-org1 --id.secret org1adminpw --id.type user -u https://$ORG1_ADDRESS:$ORG1_PORT
fabric-ca-client register --home $DATA_DIR/org1/ca/admin --tls.certfiles $ORG1_CERTFILES --id.name user-org1 --id.secret org1userpw --id.type user -u https://$ORG1_ADDRESS:$ORG1_PORT

echo "Enrolling org2..."

ORG2_ADDRESS="0.0.0.0"
ORG2_PORT="7055"
ORG2_ADMIN="org2admin:org2adminpw"
ORG2_CERTFILES="/tmp/hyperledger/ca-org2/ca-cert.pem"

fabric-ca-client enroll --home $DATA_DIR/org2/ca/admin --tls.certfiles $ORG2_CERTFILES -u https://$ORG2_ADMIN@$ORG2_ADDRESS:$ORG2_PORT

fabric-ca-client register --home $DATA_DIR/org2/ca/admin --tls.certfiles $ORG2_CERTFILES --id.name org2-peer1 --id.secret peer1pw --id.type peer -u https://$ORG2_ADDRESS:$ORG2_PORT
fabric-ca-client register --home $DATA_DIR/org2/ca/admin --tls.certfiles $ORG2_CERTFILES --id.name org2-peer2 --id.secret peer2pw --id.type peer -u https://$ORG2_ADDRESS:$ORG2_PORT
fabric-ca-client register --home $DATA_DIR/org2/ca/admin --tls.certfiles $ORG2_CERTFILES --id.name admin-org2 --id.secret org2adminpw --id.type user -u https://$ORG2_ADDRESS:$ORG2_PORT
fabric-ca-client register --home $DATA_DIR/org2/ca/admin --tls.certfiles $ORG2_CERTFILES --id.name user-org2 --id.secret org2userpw --id.type user -u https://$ORG2_ADDRESS:$ORG2_PORT

echo "Enrolling peers..."
echo "Enrolling peers for org1..."

org1_peer1="org1-peer1:peer1pw"
org1_peer1_home="$DATA_DIR/org1/peer1"

fabric-ca-client enroll --home $org1_peer1_home --tls.certfiles $ORG1_CERTFILES -u https://$org1_peer1@$ORG1_ADDRESS:$ORG1_PORT
fabric-ca-client enroll --home $org1_peer1_home --tls.certfiles $TLS_CERTFILES -u https://org1-peer1:peer1pw@0.0.0.0:7052 --enrollment.profile tls --csr.hosts peer1-org1

echo "Enrolling peers for org2..."

org1_peer2="org1-peer2:peer2pw"
org1_peer2_home="$DATA_DIR/org1/peer2"

fabric-ca-client enroll --home $org1_peer2_home --tls.certfiles $TLS_CERTFILES -u https://$org1_peer2@$ORG1_ADDRESS:$ORG1_PORT
fabric-ca-client enroll --home $org1_peer2_home --tls.certfiles $TLS_CERTFILES -u https://$org1_peer2@$TLS_IP:$TLS_PORT --enrollment.profile tls --csr.hosts peer2-org1

fabric-ca-client enroll --home $DATA_DIR/org1/admin --tls.certfiles $ORG1_CERTFILES -u https://admin-org1:org1adminpw@$ORG1_ADDRESS:$ORG1_PORT

