import {
  Button,
  Heading,
  ListItem,
  OrderedList,
  Pane,
  Text,
  TextInputField,
} from "evergreen-ui";
import { useState } from "react";
import Pusher from "pusher-js";
import axios from "axios";

function App() {
  const [value, setValue] = useState("");
  const [channelName, updateChannel] = useState("");
  const [channelSet, setChannel] = useState(false);
  const [speakerlist, updateSpeakerlist] = useState([]);
  const [speaker, updateSpeaker] = useState({});
  const [added, setAdded] = useState(false);
  const subscribe = () => {
    var pusher = new Pusher(process.env.REACT_APP_PUSHERKEY, {
      cluster: "eu",
    });
    var channel = pusher.subscribe(channelName);
    channel.bind("update", (data) => updateSpeakerlist(data));
    axios.get(`/api/${channelName}`).then((res) => updateSpeakerlist(res.data));
    setChannel(true);
  };
  const addSpeaker = async () => {
    const result = await axios.post("/api/update", {
      channel: channelName,
      event: "add",
      name: value,
    });
    setAdded(true);
    updateSpeaker(result.data);
  };
  const removeSpeaker = async () => {
    await axios.post("/api/update", {
      channel: channelName,
      event: "remove",
      name: speaker.name,
      id: speaker.id,
    });
    setAdded(false);
    updateSpeaker({});
  };
  return (
    <Pane>
      <Pane
        display="flex"
        justifyContent="center"
        backgroundColor="#10261E
"
      >
        <Heading margin="10px" color="#FAFBFF" size={800}>
          RÆKKEFØLGE.DK
        </Heading>
      </Pane>
      {channelSet && (
        <Pane
          width="100%"
          padding="10px"
          backgroundColor="#DCF2EA"
          display="flex"
          justifyContent="center"
        >
          <Text>Forbundet til "{channelName}"</Text>
        </Pane>
      )}
      <Pane margin="15px">
        {channelSet && (
          <Pane>
            <Heading size={900}>Talere</Heading>
          </Pane>
        )}
        <Pane>
          <OrderedList>
            {speakerlist.map((item) => (
              <ListItem key={item.id}>{item.name}</ListItem>
            ))}
          </OrderedList>
        </Pane>
        <Pane>
          {channelSet ? (
            <Pane>
              {added ? (
                <Button
                  appearance="primary"
                  intent="danger"
                  onClick={() => removeSpeaker()}
                  disabled={!speaker}
                >
                  Fjern fra talerlisten
                </Button>
              ) : (
                <Pane>
                  <TextInputField
                    marginTop="50px"
                    label="Taler"
                    description="Tilføj dig som taler til listen"
                    placeholder="Dit nav"
                    onChange={(e) => setValue(e.target.value)}
                    value={value}
                  ></TextInputField>
                  <Button
                    appearance="primary"
                    intent="success"
                    onClick={() => addSpeaker()}
                    disabled={!value}
                  >
                    Tilføj til talerlisten
                  </Button>
                </Pane>
              )}
            </Pane>
          ) : (
            <Pane display="flex" justifyContent="center">
              <Pane>
                <TextInputField
                  label="Rækkefølge"
                  description="Skriv navnet på den rækkefølge du gerne vil forbinde til"
                  placeholder="Rækkefølgens navn"
                  marginTop="50px"
                  onChange={(e) => updateChannel(e.target.value)}
                  value={channelName}
                ></TextInputField>
                <Button
                  appearance="primary"
                  intent="success"
                  onClick={() => subscribe()}
                  disabled={!channelName}
                >
                  Tilmeld
                </Button>
              </Pane>
            </Pane>
          )}
        </Pane>
      </Pane>
    </Pane>
  );
}

export default App;
