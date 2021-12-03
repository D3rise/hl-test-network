export CHANNEL_NAME=workspace

../bin/cryptogen generate --config ./crypto-config.yaml

../bin/configtxgen -profile Raft             -channelID workspace-sys-channel -outputBlock ./channel-artifacts/genesis.block
../bin/configtxgen -profile workspaceChannel -channelID $CHANNEL_NAME -outputCreateChannelTx ./channel-artifacts/workspace.tx

for INDEX in {1..4}
do
	../bin/configtxgen -profile workspaceChannel -outputAnchorPeersUpdate ./channel-artifacts/Org${INDEX}MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org${INDEX}MSP
done
