import React, { Component } from 'react';
import SupplyChainContract from '../build/contracts/SupplyChain.json';
import { default as CryptoJS} from 'crypto-js';
import web3, {
    selectContractInstance, mapReponseToJSON
  } from './web3';
  import styled, { injectGlobal } from 'styled-components';

class SupplyChain extends Component{
    render(){
        return (
            <Container>
                <Header>
                    <H1>Ethereum Supply Chain</H1>
                    <H2>Lets get started in developing blockchain-based apps</H2>
                </Header>
                <TodoListContainer>
                    <InputText
                        value={this.state.newContract}
                        placeholder="Contract Address"
                        onChange={e => this.setState({ newContract: e.target.value })}
                    />
                    <InputText
                        value={this.state.locationId}
                        placeholder="Location ID"
                        onChange={e => this.setState({ locationId: e.target.value })}
                    />
                    <InputText
                        value={this.state.locationName}
                        placeholder="Location Name"
                        onChange={e => this.setState({ locationName: e.target.value })}
                    />
                    <InputText
                        value={this.state.secret}
                        placeholder="Secret"
                        onChange={e => this.setState({ secret: e.target.value })}
                    />
                    <InputText
                        value={this.state.passphrase}
                        placeholder="Passphrase"
                        onChange={e => this.setState({ passphrase: e.target.value })}
                    />
                    <button onClick={this.handleSubmit}>Create New Contract</button>
                    <button onClick={this.handleSubmit}>Submit</button>
                    <button onClick={this.onResultClick}>Get Results</button>
                    {this.state.allContracts.length > 0 &&
                        <List>
                        {this.state.allContracts.map((item, itemIndex) =>
                            <div key={item}>
                            {item}
                            </div>
                        )}
                        </List>
                    }
                </TodoListContainer>
                <PendingContainer>
                    <Pending
                        active={this.state.pending}
                        activeColor="red"
                    >
                        Transaction Pending
                    </Pending>
                    <Pending
                        active={this.state.calling}
                        activeColor="#5eef8b"
                    >
                        Reading Blockchain
                    </Pending>
                </PendingContainer>
            </Container>
        );
    }

    constructor(props){
        super(props);

        this.state = {
            allContracts: [],
            newContract: '',
            locationId: '',
            locationName: '',
            secret: '',
            passphrase: '',
            account: web3.eth.accounts[0],
            pending: false,
            calling: false
        };

        this.handleSubmit = this.handleSubmit.bind(this)
        this.onResultClick = this.onResultClick.bind(this)
    }

    async componentWillMount(){
        this.chainList = await selectContractInstance(SupplyChainContract)

    }

    async onResultClick(){
        this.chainList = await selectContractInstance(SupplyChainContract)

        // const allContracts = await this.getChainItems();
        const myLocation = await this.getResults();
        
        console.log(myLocation);
        var encryptedSecret = myLocation[3];
        var decryptedSecret = CryptoJS.AES.decrypt(encryptedSecret, this.state.passphrase).toString(CryptoJS.enc.Utf8);
        this.setState({locationName: myLocation[0], locationId: myLocation[1].c[0], secret: decryptedSecret})
    }

    async handleSubmit(){
        this.setState({pending: true});
        const chainList = await selectContractInstance(SupplyChainContract);
        console.log(chainList);
        this.setState({newContract: chainList.address})
        var encryptedSecret = CryptoJS.AES.encrypt(this.state.secret,this.state.passphrase).toString();
        await chainList.AddNewLocation(this.state.locationId, this.state.locationName, encryptedSecret, {from: this.state.account, gas:3000000});

        this.setState({locationId: '', locationName: '', secret: '', passphrase: '', pending: false});
    }

    async getResults(){
        this.setState({calling: true});

        const myLocationResp = await this.chainList.GetTrailCount.call()

        const myLocation = await this.chainList.GetLocation.call(myLocationResp-1)

        this.setState({calling: false});

        return myLocation
    }

    async getChainItems(){
        this.setState({calling: true});

        const chainListResp = await this.chainList.getChainItems.call();
        const allContracts = mapReponseToJSON(
            chainListResp, ['name', 'locationId', 'timestamp'], 'arrayOfObject'
        );

        this.setState({calling: false})
        return allContracts
    }
}

export default SupplyChain;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const H1 = styled.h1`
  color: #ead7d7;
  font-size: 100px;
  margin-bottom: -20px;
`;

const H2 = styled.h2`
  color: #d2bebe;
  font-size: 35px;
`;

const TodoListContainer = styled.section`
  background: #fff;
  position: relative;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1);
`;

const InputText = styled.input`
  padding: 16px 16px 16px 60px;
  border: none;
  background: rgba(0, 0, 0, 0.003);
  box-shadow: inset 0 -2px 1px rgba(0,0,0,0.03);
  width: 440px;

  position: relative;
  margin: 0;
  font-size: 24px;
  font-family: inherit;
  font-weight: inherit;
  line-height: 1.4em;

  &:focus {
    outline: none;
  }
`;

const List = styled.ul`
  width: 440px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const TodoItem = styled.li`
  position: relative;
  font-size: 24px;
  border-bottom: 1px solid #ededed;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemLabel = styled.label`
  white-space: pre-line;
  word-break: break-all;
  padding: 15px 60px 15px 15px;
  margin-left: 45px;
  display: block;
  line-height: 1.2;
  transition: color 0.4s;
`;

const Button = styled.button`
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font-size: 100%;
  vertical-align: baseline;
  font-family: inherit;
  font-weight: inherit;
  color: inherit;
  appearance: none;
  font-smoothing: antialiased;
  outline: none;
`;

const DestroyBtn = styled(Button)`
  position: absolute;
  top: 0;
  right: -50px;
  bottom: 0;
  width: 40px;
  height: 40px;
  margin: auto 0;
  font-size: 30px;
  color: #cc9a9a;
  margin-bottom: 11px;
  transition: color 0.2s ease-out;
  cursor: pointer;
`;

const PendingContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
`;

const Pending = styled.div`
  color: ${props => props.active ? props.activeColor || 'red' : '#c7c7c7'};
`;

injectGlobal`
  @import url('https://fonts.googleapis.com/css?family=Roboto');

  body {
    background-color: whitesmoke;
    font-family: 'Roboto', sans-serif;
  }
`