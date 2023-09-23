'use client';

import { Button, Flex, Heading, Link, Stack } from '@chakra-ui/react';
import { type CreditApplication } from '@/types/CreditApplication';
import { memo, useMemo, useState } from 'react';
import ComboBox from '@/components/ComboBox';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { addressFromPerson } from '@/utils/format/addressFromPerson';
import financeFormat from '@/utils/finance/format';
import StackLayout from '@/components/StackLayout';

const CreditAppsPage = ({ apps }: { apps: CreditApplication[] }) => {
  const [selectedName, setSelectedName] = useState(apps[0].key);

  const selected = useMemo(() => {
    if (!selectedName) {
      return null;
    }
    return apps.find((a) => a.key === selectedName);
  }, [selectedName, apps]);

  const options = useMemo(() => apps.map((a) => a.key).reverse(), [apps]);

  const pdfGen = async () => {
    return fetch('/api/creditApplications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selected),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        res ? window.open(res.url, '_blank') : alert('Error generating PDF');
      });
  };

  return (
    <StackLayout>
      <Heading as={'h1'}>Credit Applications</Heading>
      <ComboBox
        options={options}
        setValue={(e) => {
          setSelectedName(e as string);
        }}
      />
      <Stack
        direction={{
          base: 'column',
          md: 'row',
        }}
      >
        <Flex flexDirection={'column'} alignItems={'center'} gap={4}>
          <Link
            href={selected?.proofOfResidency}
            target="_blank"
            rel="noreferrer"
            flexBasis={1}
            padding={4}
            textAlign={'center'}
            fontSize={'2xl'}
            background={'gray.600'}
            borderRadius={'md'}
            w={'full'}
          >
            Proof of Residency
          </Link>

          <Link
            href={selected?.paystub}
            target="_blank"
            rel="noreferrer"
            flexBasis={1}
            padding={4}
            textAlign={'center'}
            fontSize={'2xl'}
            background={'gray.600'}
            borderRadius={'md'}
            w={'full'}
          >
            Paystub
          </Link>

          <Link
            href={selected?.license2}
            target="_blank"
            rel="noreferrer"
            flexBasis={1}
            padding={4}
            textAlign={'center'}
            fontSize={'2xl'}
            background={'gray.600'}
            borderRadius={'md'}
            w={'full'}
          >
            <span>
              License
              <br />
              {selected?.license}
              <br />
              {selected?.licenseExpirationDate}
            </span>
          </Link>
        </Flex>
        <Stack>
          <Heading as={'h2'}>{selected?.key}</Heading>
          <Stack>
            <p>
              Address:{' '}
              {
                addressFromPerson({
                  person: {
                    address_1: selected?.street,
                    state_province: selected?.state,
                    zip_postal: selected?.zip,
                  },
                }).full
              }
            </p>
            <p>
              Employment:{' '}
              {[
                selected?.jobDescription,
                selected?.deparatment,
                selected?.supervisorName,
                selected?.companyName,
                selected?.companyAddress,
                selected?.companyPhone,
              ].join(' | ')}
            </p>
            <p>
              Housing:{' '}
              {[
                selected?.landlordsName || selected?.mortageCompany,
                selected?.phone || selected?.phone2,
                financeFormat({
                  num: selected?.paymentPerMonth || selected?.paymentPerMonth1,
                }),
              ].join(' | ')}
            </p>
            <p>
              First reference:{' '}
              {[
                selected?.name,
                selected?.street1,
                selected?.cityStateZip1,
                selected?.phone3,
              ].join(' | ')}
            </p>
          </Stack>
          <Button
            onClick={pdfGen}
            flexBasis={1}
            padding={4}
            textAlign={'center'}
            fontSize={'2xl'}
            background={'gray.600'}
            borderRadius={'md'}
            w={'full'}
          >
            Generate PDF
          </Button>
        </Stack>
      </Stack>
    </StackLayout>
  );
};

export default memo(CreditAppsPage);
