export const processApplyMosaic = `
    mutation processApplyMosaic($input: ProcessApplyMosaicInput!) {
        processApplyMosaic(input: $input) {
            statusCode
            body
        }
    }
`;

export const processSendMail = `
    mutation processSendMail($input: ProcessSendMailInput!) {
        processSendMail(input: $input) {
            statusCode
            body
        }
    }
`;
