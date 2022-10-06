import {
  Select,
  Button,
  Card,
  TextField,
  SkeletonBodyText,
  Page,
  Stack,
  FormLayout,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import useFetch from "./useFetch";

const Main = () => {
  const [loading, setLoading] = useState(false);
  const [containValue, setContainValue] = useState([]);
  const [category, setCategory] = useState([]);
  const [child, setChild] = useState("true");

  const [obj, setObj] = useState({
    target_marketplace: "eyJtYXJrZXRwbGFjZSI6ImFsbCIsInNob3BfaWQiOm51bGx9",
    selected: [],
    user_id: "63329d7f0451c074aa0e15a8",
    target: {
      marketplace: "amazon",
      shopId: "530",
    },
  });
  const [loadAttr, setLoadAttr] = useState(false);
  const [attribute, setAttribute] = useState([]);

  const [add, setAdd] = useState(false);
  const [modal, setModal] = useState(false);
  const [count, setCount] = useState([]);
  const [attrVal, setAttrVal] = useState([]);

  const [fetch1] = useFetch(
    "https://multi-account.sellernext.com/home/public/connector/profile/getAllCategory/",
    obj
  );
  const [fetch2] = useFetch(
    "https://multi-account.sellernext.com/home/public/connector/profile/getCategoryAttributes/",
    {
      data: {
        barcode_exemption: false,
        browser_node_id: "1380072031",
        category: "major_appliances",
        sub_category: "microwaveoven",
      },
      source: {
        marketplace: "shopify",
        shopId: "500",
      },
      target: {
        marketplace: "amazon",
        shopId: "530",
      },
      target_marketplace: "eyJtYXJrZXRwbGFjZSI6ImFsbCIsInNob3BfaWQiOm51bGx9",
      user_id: "63329d7f0451c074aa0e15a8",
    }
  );

  const fetchAttribute = () => {
    setModal(true);
    setCount([...count, 1]);
  };

  useEffect(() => {
    if (child === "true") {
      (async () => {
        setLoading(true);
        await fetch1()
          .then((actualData) => {
            let temp = [];

            actualData.data.forEach((item, index) => {
              temp.push({
                key: index,
                label: item.name,
                value: JSON.stringify(item.parent_id),
                parentid: item.parent_id,
                haschildren: item.hasChildren.toString(),
              });
            });
            setCategory([...category, [...temp]]);
          })
          .finally(() => {
            // setLoading(false);
          });
        setLoading(false);
      })();
    } else {
      setLoadAttr(true);
      fetch2()
        .then((actual) => {
          var labeled = [];
          for (let i in actual.data) {
            for (let j in actual.data[i]) {
              labeled.push({
                key: j,
                label: actual.data[i][j].label,
                value: actual.data[i][j].label,
                disabled: false,
              });
            }
          }
          setAttribute([...labeled]);
          console.log(attribute);
        })
        .finally(() => {
          setLoadAttr(false);
        });

      setAdd(true);
    }
  }, [obj.selected]);

  // SELECT CHANGE VALUES
  const handleSelectChange = (value, indx) => {
    var temp = containValue;
    temp[indx] = value;
    setContainValue([...temp]);

    setObj({
      ...obj,
      selected: JSON.parse(value),
    });

    category[indx].forEach((item) => {
      if (item.value === value) {
        setChild(item.haschildren);
      }
    });
  };

  // ONCHANGE OF ATTRIBUTE SELECT
  const handleAttribute = (value) => {
    setAttrVal([
      ...attrVal,
      {
        val: value,
      },
    ]);
    setAttribute(
      attribute.filter((item) => {
        if (value === item.value) {
          item.disabled = true;
        }
        return item;
      })
    );
  };
  // DELETE SELECT TAG
  const remove = (ind) => {
    // debugger;
    var changeVl = "";
    setAttrVal(
      attrVal.filter((item, index) => {
        if (index === ind) {
          console.log("attr Val: ", item.val);
          changeVl = item.val;
          return index !== ind;
        }
        return item;
      })
    );

    setCount(
      count.filter((item, index) => {
        return index !== ind;
      })
    );

    setAttribute(
      attribute.filter((item, index) => {
        if (item.value == changeVl) {
          // console.log(item);
          item.disabled = false;
        }
        return item;
      })
    );
  };

  // JSX
  return (
    <>
      <Page>
        <Page>
          <Card sectioned title="Category">
            {/* <Card sectioned> */}
            {category.map((item, index) => {
              return (
                <Card sectioned>
                  <FormLayout>
                    <Select
                      placeholder="--select--"
                      Label="Choose Category"
                      key={index}
                      options={category[index]}
                      onChange={(value) => handleSelectChange(value, index)}
                      value={containValue[index]}
                    />
                  </FormLayout>
                </Card>
              );
            })}
            {/* </Card> */}
            {loading ? (
              <Card sectioned>
                <SkeletonBodyText lines={2} />
              </Card>
            ) : null}
          </Card>
        </Page>

        {modal ? (
          <div className="selectMain">
            <Page>
              <Card sectioned title="Add Attribute">
                {count.map((item, index) => {
                  return (
                    <div className="selectOption">
                      <Card sectioned>
                        <Button plain destructive onClick={() => remove(index)}>
                          DELETE
                        </Button>

                        <Stack vertical spacing="extraTight">
                          <FormLayout>
                            <FormLayout.Group condensed>
                              <Select
                                placeholder="--select--"
                                // disabled={attribute?.[index]?.disabled}
                                key={index}
                                options={attribute}
                                onChange={(value) => {
                                  handleAttribute(value, index);
                                }}
                                value={attrVal?.[index]?.val}
                              />

                              <TextField
                                placeholder="type Something.."
                                onChange={() => {}}
                                autoComplete="off"
                              />
                            </FormLayout.Group>
                          </FormLayout>
                        </Stack>
                      </Card>
                    </div>
                  );
                })}
              </Card>
            </Page>
          </div>
        ) : null}
        {add ? (
          <div className="btn">
            {loadAttr ? (
              <Button loading>Add Attributes</Button>
            ) : (
              <Button primary onClick={fetchAttribute}>
                Add Attributes
              </Button>
            )}
          </div>
        ) : null}
      </Page>
    </>
  );
};

export default Main;
