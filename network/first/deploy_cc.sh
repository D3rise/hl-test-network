#!/bin/bash
PATH=$PATH:$PWD/../fabric-bin

CHAINCODE_LABEL=$1
CHAINCODE_PATH=$2
CHAINCODE_LANG=$3
CHAINCODE_VERSION=$4
CHAINCODE_SEQUENCE=$5

if [[ $# -lt 5 ]]
then
    echo "deploy_cc.sh [label] [path] [lang] [version] [sequence]"
    exit
fi

cp -r $CHAINCODE_PATH ./orgs/common/chaincode

docker exec -ti cli-org1 peer lifecycle chaincode package ${CHAINCODE_LABEL}.tar.gz --label ${CHAINCODE_LABEL} -l ${CHAINCODE_LANG} -p ./chaincode

for i in {1..3}
do
    docker exec -ti cli-org$i peer lifecycle chaincode install ${CHAINCODE_LABEL}.tar.gz
    docker exec -ti cli-org$i peer lifecycle chaincode queryinstalled >&log.txt
    PACKAGE_ID=$(sed -n "/${CHAINCODE_LABEL}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    docker exec -ti cli-org$i peer lifecycle chaincode approveformyorg -C wsr -n ${CHAINCODE_LABEL} --version ${CHAINCODE_VERSION} --sequence ${CHAINCODE_SEQUENCE} --package-id ${PACKAGE_ID}
done

docker exec -ti cli-org1 peer lifecycle chaincode commit -o orderer:7050 -C wsr --sequence $CHAINCODE_SEQUENCE --version $CHAINCODE_VERSION -n $CHAINCODE_LABEL --peerAddresses peer1-org2:9052 --peerAddresses peer1-org3:9053