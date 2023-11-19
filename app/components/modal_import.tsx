import {
    Button,
    Modal,
    BlockStack,
    Thumbnail,
  } from '@shopify/polaris';
  import {useState, useCallback} from 'react';
  
  export default function ModalWithPrimaryActionExample(props: { src: string | React.FunctionComponent<React.SVGProps<SVGSVGElement>>; title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined; }) {
    const [active, setActive] = useState(false);
  
    const toggleModal = useCallback(() => setActive((active) => !active), []);
  
    const activator = <Button onClick={toggleModal}>Import Reviews</Button>;
    
    return (
          <Modal
            activator={activator}
            open={active}
            onClose={toggleModal}
            title="Import Reviews"
            primaryAction={{
              content: 'Close',
              onAction: toggleModal,
            }
          }
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
              <BlockStack>
                 <p>
                      You can share this discount link with your customers via
                      email or social media. Your discount will be automatically
                      applied at checkout.
                    </p>
              </BlockStack> 
            </Modal.Section>
          </Modal>
    );
  }