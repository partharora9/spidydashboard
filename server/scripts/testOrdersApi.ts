import handler from '../../api/orders';

async function run() {
  console.log('Testing handler...');
  let status = 0;
  let responseData: any = null;

  const req = {
    method: 'POST',
    url: '/api/orders',
    body: {
      plan: 'student_edition',
      name: 'Parth Arora',
      email: 'parthxcore@gmail.com',
      phone: '8700383626',
      college: 'Hindu College',
      consent: true,
    },
    headers: { 'user-agent': 'NodeTest' },
  };

  const res = {
    setHeader: () => {},
    status: (code: number) => {
      status = code;
      return {
        json: (data: any) => {
          responseData = data;
        },
      };
    },
    end: () => {},
  };

  await handler(req, res);
  console.log('Create Order Status:', status);
  console.log('Reference:', responseData?.reference);
  console.log('Price:', responseData?.exactAmountFormatted);
  console.log('UPI URI:', responseData?.upiUri);
  console.log('QR Code generated length:', responseData?.qrCodeDataUrl?.length);

  // Test status polling
  let pollStatus = 0;
  let pollData: any = null;
  const pollReq = {
    method: 'GET',
    url: `/api/orders/${responseData.reference}/status`,
    headers: {},
  };
  const pollRes = {
    setHeader: () => {},
    status: (code: number) => {
      pollStatus = code;
      return {
        json: (data: any) => {
          pollData = data;
        },
      };
    },
    end: () => {},
  };

  await handler(pollReq, pollRes);
  console.log('Poll Order Status:', pollStatus, pollData?.status);

  // Test UTR submission
  let utrStatus = 0;
  let utrData: any = null;
  const utrReq = {
    method: 'POST',
    url: `/api/orders/${responseData.reference}/utr`,
    body: {
      utr: String(Math.floor(100000000000 + Math.random() * 900000000000)),
      email: 'parthxcore@gmail.com',
    },
    headers: {},
  };
  const utrRes = {
    setHeader: () => {},
    status: (code: number) => {
      utrStatus = code;
      return {
        json: (data: any) => {
          utrData = data;
        },
      };
    },
    end: () => {},
  };

  await handler(utrReq, utrRes);
  console.log('UTR Submit Status:', utrStatus, utrData);

  // Poll status again
  await handler(pollReq, pollRes);
  console.log('Order status after UTR:', pollData?.status, 'UTR:', pollData?.utr);

  // Test Invoice
  let invStatus = 0;
  let invData: any = null;
  const invReq = {
    method: 'GET',
    url: `/api/orders/${responseData.reference}/invoice`,
    headers: {},
  };
  const invRes = {
    setHeader: () => {},
    status: (code: number) => {
      invStatus = code;
      return {
        json: (data: any) => {
          invData = data;
        },
      };
    },
    end: () => {},
  };
  await handler(invReq, invRes);
  console.log('Invoice Status:', invStatus, 'Invoice No:', invData?.invoiceNumber, 'Amount:', invData?.plan?.amountFormatted);

  if (status === 201 && utrStatus === 200 && pollData?.status === 'pending_verification' && invStatus === 200) {
    console.log('🎉 ALL END-TO-END CHECKOUT & INVOICE TESTS PASSED LOCALLY!');
  } else {
    console.error('❌ Check failed');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('Test failed with error:', e);
  process.exit(1);
});
