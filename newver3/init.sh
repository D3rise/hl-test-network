export PATH=$PATH:$PWD/../fabric-bin

for i in {0..3} 
do
    sudo fabric-ca-client enroll -H ./data/org${i}/admin -u http://admin:adminpw@0.0.0.0:705$(expr 2 + $i)
    
    mkdir ./data/org$i/admin/msp/admincerts
    cp ./data/org$i/admin/msp/signcerts ./data/org$i/admin/msp/admincerts

    mkdir ./data/org$i/msp
    mkdir ./data/org$i/msp/{admincerts,cacerts,users}
done

sudo fabric-ca-client register -H ./data/org0/admin -u http://0.0.0.0:7053 --id.type orderer --id.name orderer1 --id.secret ordererpw

for i in {1..3}
do
    sudo fabric-ca-client register --id.type peer --id.name peer1-org${i} --id.secret peerpw -H ./data/org${i}/admin -u http://0.0.0.0:705$(expr 2 + $i)
    sudo fabric-ca-client enroll -H ./data/org${i}/peer1 -u http://peer1-org${i}:peerpw@0.0.0.0:705$(expr 2 + $i)

    mkdir ./data/org${i}/peer1/msp/admincerts
    cp ./data/org${i}/admin/msp/signcerts/cert.pem ./data/org${i}/peer1/msp/admincerts
done

for i in {0..3}
do
    cp ./data/ca-org${i}/crypto/ca-cert.pem ./data/org${i}/msp/cacerts
    cp ./data/org${i}/admin/msp/signcerts/cert.pem ./data/org${i}/msp/admincerts
done