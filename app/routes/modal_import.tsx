import {
    Button,
    Modal,
    BlockStack,
    Thumbnail,
    FormLayout,
    TextField,
  } from '@shopify/polaris';
import { makeRequest, scrapeReviews } from '~/webscraper/ali-scraper';
import db from "../db.server"
import { useCallback, useState } from 'react';
import { log } from 'console';
import { useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const first = 10;
  const after = null; // Modify this as per your pagination logic
  const variables = {
    first: first,
    after: after
  };
    // If reviewsArray is an array of review objects
    const testResult = await db.review.create({
      data: {
        content: "Test review",
        productId: "TestProductId",
        stars: 109
      }
  });
}
export default function ModalWithPrimaryActionExample(props: {
    productid: any; src: string | React.FunctionComponent<React.SVGProps<SVGSVGElement>>; title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined; 
}) {
    const [active, setActive] = useState(false);
    const testing = useLoaderData()
    const toggleModal = useCallback(() => setActive((active) => !active), []);
    const [productUrl, setProductUrl] = useState('');
    const [storeNumber, setStoreNumber] = useState('');

    const handleUrlChange = (value) => setProductUrl(value);
    const handleStoreNumberChange = (value) => setStoreNumber(value);
    
    const handleSubmit = async () => {
      console.log("Product URL:", productUrl);
      console.log("Store Number:", storeNumber);
      
      try {
          // Assuming scrapeReviews returns a Promise
          const reviewsArray = await scrapeReviews();
          console.log("Reviews: ", reviewsArray);
  
          // If reviewsArray is an array of review objects
          const results = await Promise.all(reviewsArray.map(async (rev) => {
              return await db.review.create({
                  data: {
                      content: rev['Reviews'],
                      productId: props.productid,
                      stars: rev['StarRating']
                  }
              });
          }));
  
          console.log("Database operation results: ", results);
  
          // Test creation of a single review
          const testResult = await db.review.create({
              data: {
                content: "Test review",
                productId: "TestProductId",
                stars: 5
              }
          });
  
          console.log("Test result: ", testResult);
  
      } catch (error) {
          console.error("Error in creating reviews or test review:", error);
      } finally {
          toggleModal();
      }
  };
  
  
    const activator = <Button onClick={toggleModal}>Import Reviews</Button>;
    
    return (
          <Modal
            activator={activator}
            open={active}
            onClose={toggleModal}
            title="Enter Details"
            primaryAction={{
                content: 'Submit',
                onAction: handleSubmit,
            }}
            secondaryActions={[{
                content: 'Cancel',
                onAction: () => toggleModal(),
            }]}
          
          >
            <Modal.Section>
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
                <div style={{ marginRight: '16px' }}>
                  <Thumbnail
                    source={props.src}
                    alt={props.title}
                    size="small"
                  />
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {props.title}
                </div>
              </div>
              <FormLayout>
                    <TextField
                        value={productUrl}
                        onChange={handleUrlChange}
                        label="Product URL"
                        type="url"
                        autoComplete="off"
                    />
                    <TextField
                        value={storeNumber}
                        onChange={handleStoreNumberChange}
                        label="Store Number"
                        type="text"
                        autoComplete="off"
                    />
                </FormLayout> 
            </Modal.Section>
          </Modal>
    );
  }