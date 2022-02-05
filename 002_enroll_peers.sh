#/bin/bash
PATH=$PATH:$PWD/fabric-bin
TLS_CERTFILES="/tmp/hyperledger/ca-tls/ca-cert.pem"
TLS_IP="0.0.0.0"
TLS_PORT="7052"

for i in {1..2}
do
    for j in {1..2}
    do
        fabric-ca-client enroll -u https://org${i}-peer${j}:peer${j}pw@$TLS_IP:$TLS_PORT --home /tmp/hyperledger/ca-org${i}/peer${j} --tls.certfiles $TLS_CERTFILES
    done
done
