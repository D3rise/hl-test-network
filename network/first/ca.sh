#!/bin/bash
docker-compose down
docker-compose up ca-org0 ca-org1 ca-org2 ca-org3 -d
sleep 2
export PATH=$PATH:$PWD/../fabric-bin

IP="0.0.0.0"
for i in {0..3}
do
    mkdir orgs/org$i orgs/org$i/msp orgs/org$i/msp/{admincerts,cacerts,users}
    
    ADDRESS="http://admin:adminpw@$IP:705$(expr 1 + $i)"
    fabric-ca-client enroll -u $ADDRESS -H orgs/org$i/admin

    cp orgs/ca/org$i/ca-cert.pem orgs/org$i/msp/cacerts
    cp orgs/org$i/admin/msp/signcerts/cert.pem orgs/org$i/msp/admincerts
    mkdir orgs/org$i/admin/msp/admincerts
    cp orgs/org$i/admin/msp/signcerts/cert.pem orgs/org$i/admin/msp/admincerts

    mkdir orgs/org$i/admin/msp/users
done

fabric-ca-client register -H orgs/org0/admin/ -u http://0.0.0.0:7051 --id.type orderer --id.name orderer --id.secret ordererpw
fabric-ca-client enroll -H orgs/org0/orderer -u http://orderer:ordererpw@0.0.0.0:7051
mkdir orgs/org0/orderer/msp/admincerts
cp orgs/org0/admin/msp/signcerts/cert.pem orgs/org0/orderer/msp/admincerts

for i in {1..3}
do
    fabric-ca-client register -H orgs/org$i/admin -u http://0.0.0.0:705$(expr 1 + $i) --id.type peer --id.name peer1 --id.secret peerpw
    fabric-ca-client enroll -H orgs/org$i/peer1 -u http://peer1:peerpw@0.0.0.0:705$(expr 1 + $i)
    mkdir orgs/org$i/peer1/msp/admincerts
    cp orgs/org$i/admin/msp/signcerts/cert.pem orgs/org$i/peer1/msp/admincerts
done

mkdir orgs/common
configtxgen -profile WSRGenesis -channelID syschannel -outputBlock orgs/org0/orderer/genesis.block
configtxgen -profile WSR -channelID wsr -outputCreateChannelTx orgs/common/wsrchannel.tx

configtxgen -profile WSR -channelID wsr -outputAnchorPeersUpdate orgs/org1/anchors.tx -asOrg Users
configtxgen -profile WSR -channelID wsr -outputAnchorPeersUpdate orgs/org2/anchors.tx -asOrg Shops
configtxgen -profile WSR -channelID wsr -outputAnchorPeersUpdate orgs/org3/anchors.tx -asOrg Bank

docker-compose up -d
sleep 2
docker exec -ti cli-org1 peer channel create -f wsrchannel.tx -c wsr --outputBlock wsr.block -o orderer:7050
for i in {1..3}
do
    docker exec -ti cli-org$i peer channel join -b wsr.block -o orderer:7050
done

for i in {1..3}; do
    docker exec -ti cli-org$i peer channel update -f ../org${i}/anchors.tx -o orderer:7050 -c wsr
done
    