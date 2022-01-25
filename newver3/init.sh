export PATH=$PATH:$PWD/../fabric-bin

for i in {0..3} 
do
    sudo fabric-ca-client enroll -H ./data/org${i}/admin -u http://admin:adminpw@0.0.0.0:705$(expr 2 + $i)
done

sudo fabric-ca-client register -H ./data/org0/admin -u http://0.0.0.0:7053 --id.type orderer --id.name orderer1 --id.secret ordererpw

for i in {1..3}
do
    sudo fabric-ca-client register -H ./data/org${i}/admin -u http://