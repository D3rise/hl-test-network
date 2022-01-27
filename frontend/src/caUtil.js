export const convertToX509 = (enrollment, orgMspId) => {
    return {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: orgMspId,
        type: 'X.509',
    };
}