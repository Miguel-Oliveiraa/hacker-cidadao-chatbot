import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import OpenAI from "openai";
import "dotenv/config"; // This will automatically load variables from .env
import axios from "axios";

const parentsData = await axios.get("http://127.0.0.1:5000/dados");
const data = JSON.parse(JSON.stringify(parentsData.data));

const chatgptClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new Client();

client.on("ready", () => {
  console.log("Client is ready!");
  data.forEach((element) => {
    client.sendMessage(
      `${element.telefone}@c.us`,
      `Oi, tudo bem, ${element.Nome}? 😊

Sou o chatbot da Prefeitura e estou aqui para te ajudar! Vi que ${
        element.Filhos[0]
      } está na fase de entrar na ${element.escolas_proximas[0][
        `Tipo`
      ].toLowerCase()}, um momento super importante no desenvolvimento dele(a). 💙 Para facilitar essa escolha, selecionei uma lista das ${element.escolas_proximas[0][
        `Tipo`
      ].toLowerCase()} mais próximas de você, organizadas pelas avaliações institucionais.

📍 Aqui estão as três melhores opções perto de você:

1️⃣ ${element.escolas_proximas[0][`Tipo`]} ${
        element.escolas_proximas[0][`Nome da Escola`]
      }
      ⭐ SAEB: ${
        element.escolas_proximas[0][`Nota SAEB - 2023 Media`] == undefined
          ? "Não disponível"
          : element.escolas_proximas[0][`Nota SAEB - 2023 Media`]
      } | 🚍 Transporte gratuito: ${
        element.escolas_proximas[0][`Transporte`] ===
        "nao ha dados de transporte publico para essa escola"
          ? "Não"
          : "Sim"
      }
2️⃣ ${element.escolas_proximas[1][`Tipo`]} ${
        element.escolas_proximas[1][`Nome da Escola`]
      }
      ⭐ SAEB: ${
        element.escolas_proximas[1][`Nota SAEB - 2023 Media`] == undefined
          ? "Não disponível"
          : element.escolas_proximas[1][`Nota SAEB - 2023 Media`]
      } | 🚍 Transporte gratuito: ${
        element.escolas_proximas[1][`Transporte`] ===
        "nao ha dados de transporte publico para essa escola"
          ? "Não"
          : "Sim"
      }
3️⃣ ${element.escolas_proximas[2][`Tipo`]} ${
        element.escolas_proximas[2][`Nome da Escola`]
      }
      ⭐ SAEB: ${
        element.escolas_proximas[2][`Nota SAEB - 2023 Media`] == undefined
          ? "Não disponível"
          : element.escolas_proximas[2][`Nota SAEB - 2023 Media`]
      } | 🚍 Transporte gratuito: ${
        element.escolas_proximas[2][`Transporte`] ===
        "nao ha dados de transporte publico para essa escola"
          ? "Não"
          : "Sim"
      }

Se quiser mais detalhes sobre alguma delas, é só me chamar! Estou aqui para te ajudar nessa decisão. 😉`
    );
  });
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message_create", async (message) => {
  if (message.body.startsWith("!")) {
    const telefone = message.from.split("@")[0];
    // Example usage
    const dataset = data.find((parent) => parent.telefone === telefone);
    // const response = completion.choices[0].message.content;
    const response = await answerQuestion(message.body.split("!")[1], dataset);
    // send back "pong" to the chat the message was sent in
    client.sendMessage(message.from, response);
  }
});

async function answerQuestion(question, dataset) {
  // const context = await createContext(question, dataset, maxLen);
  const context = JSON.stringify(dataset);

  try {
    const response = await chatgptClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Responda as perguntas do usuario (chame-o pelo nome, que esta no campo "Nome"), sobre escolas e creches com base no contexto abaixo, caso ele pergunte como matricular o filho em uma escola ou creche responda com "📌 Como fazer a matrícula em uma escola ou creche municipal do Recife? \n\n Para matricular seu filho, acesse o portal Matrícula Online Recife através do site \n\n 👉 https://matriculaonline.recife.pe.gov.br \n\n Lá, você pode verificar a disponibilidade de vagas e obter informações atualizadas sobre todo o processo. ✅📚", e se a pergunta não puder ser respondida diga "Desculpe, eu ainda não sei responder isso. Teria outra coisa que eu posso ajudar? 🙂"\n\nContexto: ${context}\n\n---\n\nPergunta: ${question}\nResposta:`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return "";
  }
}

client.initialize();
