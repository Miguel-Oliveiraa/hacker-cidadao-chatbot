import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import OpenAI from "openai";
import "dotenv/config"; // This will automatically load variables from .env

const chatgptClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new Client();

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message_create", async (message) => {
  if (message.body) {
    // const message = "Qual o maior predio do mundo?";
    const completion = await chatgptClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `_id,rpa,tipo_cod,tipo,cod_escola,escola,inep,rua,numero,cod_bairro,bairro,metragem,qtd_alunos,qtd_turmas,qtd_professores,escola_climatizada,data_visita,quadra_coberta,quadra_descoberta,biblioteca,sala_recurso,gestor,longitude,latitude
          1,1,1,ESCOLA MUNICIPAL,90,ALMIRANTE SOARES DUTRA,26120658,CAMUTANGA,180,51,CABANGA,"764,3",429,18,13,SIM,2018-02-27T00:00:00,NÃO,NÃO,SIM,SIM,VERONICA MARIA LIMA,-34.89535,-8.07895
          2,1,1,ESCOLA MUNICIPAL,289,CIDADAO HERBERT DE SOUZA,26121972,ARNOBIO MARQUES,310,108,SANTO AMARO,206,163,12,11,NÂO,,NÃO,NÃO,NÃO,SIM,ANA CLAUDIA DO NASCIMENTO SILVA,-34.88707,-8.04576
          3,1,1,ESCOLA MUNICIPAL,256,DO COQUE,26122898,MIRANDOPOLIS,35,43,ILHA JOANA BEZERRA,"840,5",622,26,18,NÂO,,NÃO,NÃO,SIM,SIM,GRIJALBA MARIA PESSOA,-34.90022,-8.07145      
          ${message.body}`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    // send back "pong" to the chat the message was sent in
    client.sendMessage(message.from, response);
  }
});

client.initialize();
