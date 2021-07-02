const Discord = require("discord.js");
const client = new Discord.Client();
const { token, prefix } = require("./config.json");
client.on("message", async message => {
    console.log("Un mensaje fue escrito!\nAutor:\n"+message.author.tag+"\nContenido:\n"+message.content)
const args = message.content.slice(prefix.length).trim().split(/ +/g);
const command = args.shift().toLowerCase();
const db = require("megadb");
const sugerencias_channels = new db.crearDB("sugerencias");
const aprovadas_channels = new db.crearDB("aprovadas");
const denegadas_channels = new db.crearDB("denegadas");
const indecisas_channels = new db.crearDB("indecisas");
if(command === "suggestions"){
    if(message.channel.type === ("dm")){
        const emved = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
        .setDescription("Debes usar este comando en un servidor.")
        .setColor("RANDOM")
        .setFooter("Modulo de sugerencias. ", client.user.displayAvatarURL({dynamic: true, format: "jpg"}))
        return message.channel.send(emved)
    }
    if(!args[0]){
        const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
        .setDescription("**SUGERENCIAS: "+message.guild.name.toUpperCase()+"**\nModulo de sugerencias.")
        .setColor("RANDOM")
        .setThumbnail(message.guild.iconURL({dynamic: true, format: "png"}))
        .setFooter("Modulo de sugerencias.", client.user.displayAvatarURL())
        .addField("**Propiedad: `setchannel`:**", "Establece el canal donde se enviarán las sugerencias.", true)
        .addField("**Propiedad: `setapproved`:**", "Establece el canal de sugerencias aprobadas.", true)
        .addField("**Propiedad: `setdenied`:**", "Establece el canal de sugerencias denegadas.", true)
        .addField("**Propiedad: `setundefined`:**", "Establece el canal de sugerencias en indeciso.", true)
        return message.channel.send(embed)
    } else if(args[0] === "setchannel"){
        const canal = message.mentions.channels.first() || message.channel;
        await sugerencias_channels.establecer(`${message.guild.id}`,`${canal.id}`);
        return message.channel.send("El nuevo canal de sugerencias es: <#"+canal.id+">");
    } else if(args[0] === "setapproved"){
        const aprovado = message.mentions.channels.first() || message.channel;
        await aprovadas_channels.establecer(`${message.guild.id}`, `${aprovado.id}`);
        return message.channel.send("El nuevo canal de sugerencias aprovadas es: <#"+aprovado.id+">");
    } else if(args[0] === "setdenied"){
        const denegado = message.mentions.channels.first() || message.channel;
        await denegadas_channels.establecer(`${message.guild.id}`, `${denegado.id}`);
        return message.channel.send("El nuevo canal de sugerencias denegadas es: <#"+denegado.id+">");
    } else if(args[0] === "setundefined"){
        const indefinido = message.channel.channels.first() || message.channel;
        await indecisas_channels.establecer(`${message.guild.id}`, `${indefinido.id}`);
        return message.channel.send("El nuevo canal de sugerencias indecisas es: <#"+indefinido.id+">");
    } 
} else if(command === "suggest"){
    if(!sugerencias_channels.tiene(`${message.guild.id}`)){
        const nohaycanal = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
        .setDescription("El canal de sugerencias no esta establecido.")
        .setColor("RANDOM")
        .setFooter("Modulo de sugerencias.", client.user.displayAvatarURL())
        .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpg"}))
        return message.channel.send(nohaycanal)
    }
    if(sugerencias_channels.tiene(`${message.guild.id}`)){
    let canal = await sugerencias_channels.obtener(`${message.guild.id}`)
    const suggestnueva = args.join(" ");
    if(!suggestnueva){
        const nohaysuggest = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
        .setDescription("Debes poner la nueva sugerencia que deseas enviar.")
        .setColor("RANDOM")
        .setFooter("Modulo de sugerencias.", client.user.displayAvatarURL())
        .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpg"}))
        return message.channel.send(nohaysuggest);
    }

    const embedsuggest = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
    .setDescription(suggestnueva)
    .setColor("RANDOM")
    .setFooter("MODULO DE SUGERENCIAS DE "+message.guild.name.toUpperCase(), client.user.displayAvatarURL())
    .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpg"}))
    client.channels.cache.get(canal).send(embedsuggest).then(m => {
        m.react("👍");
        m.react("👎");
        sugerencias_channels.establecer(`${suggestnueva}`)
        sugerencias_channels.establecer(`${m.id}`);
    })
}
} else if(command === "approve"){
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("no tienes los permisos requeridos para aprovar las sugerencias.");
    const canal = sugerencias_channels.obtener(`${message.guild.id}`)
    if(!canal){
        const embedfalta = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
        .setDescription("El canal de sugerencias no está establecido.")
        .setColor("RANDOM")
        .setFooter("Modulo de sugerencias.", client.user.displayAvatarURL())
        .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpeg"}))
        message.channel.send(embedfalta);
    }
    const sugerenciaID = args[0];
    if(!sugerenciaID){
        const embedID = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
        .setDescription("Debes poner la ID del mensaje de la sugerencia.")
        .setColor("RANDOM")
        .setFooter("Módulo de sugerencias.", client.user.displayAvatarURL())
        .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpg"}))
        message.channel.send(embedID)
    }
    else if(isNaN(sugerenciaID)) {
     const embedNaN = new Discord.MessageEmbed()
     .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
     .setDescription("Debes poner una ID válida, no letras ni simbolos.")
     .setColor("RANDOM")
     .setFooter("Módulo de sugerencias.", client.user.displayAvatarURL())
     .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpg"}))
     message.channel.send(embedNaN)
    }
    else if(!sugerencias_channels.tiene(`${message.guild.id}`,`${sugerenciaID}`)){
        const nohayID = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpeg"}))
        .setDescription("Esa ID no le pertenece a ningúna sugerencia.")
        .setColor("RANDOM")
        .setFooter("Modulo de sugerencias.", client.user.displayAvatarURL())
        .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpg"}))
        message.channel.send(nohayID)
    }
    const canalAP = await aprovadas_channels.tiene(`${message.guild.id}`)
    if(!canalAP){
        const embedAP = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpeg"}))
        .setDescription("El canal de sugerencias aprovadas no está establecido en este servidor.")
        .setColor("RANDOM")
        .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpeg"}))
        .setFooter("Modulo de sugerencias.", client.user.displayAvatarURL())
        message.channel.send(embedAP)
    }
  var channelS = await aprovadas_channels.obtener(`${message.guild.id}`)
  const suggestantigua = await sugerencias_channels.obtener(`${suggestnueva}`);
    const razon = args.slice(1).join(" ");
    if(sugerencias_channels.tiene(`${message.guild.id}`,`${sugerenciaID}`)){
        const sugerenciaAP = await sugerencias_channels.obtener(`${sugerenciaID}`);
        const embedAP = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
        .setDescription("**Sugerencia aceptada:**\n"+sugerenciaAP+"\nSugerencia:"+suggestantigua+"\n**Razón:**\n"+razon ? razon : "No se proporciono una razón")
        client.channels.cache.get(channelS).send(embedAP)
    }
}
    else if(command == ("deny")){
    const deniedC = await denegadas_channels.tiene(`${message.guild.id}`);
    if(!deniedC){
    const embedDC = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
    .setDescription("No hay ningún canal establecido para enviar las sugerencias denegadas.")
    .setColor("RANDOM")
    .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpg"}))
    .setFooter("Módulo de sugerencias.", client.user.displayAvatarURL())
    message.channel.send(embedDC)
    }
        const suggestN = args[0];
        if(!suggestN){
            const embedDC = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
    .setDescription("Debes proporcionar la ID de la sugerencia que deseas denegar.")
    .setColor("RANDOM")
    .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpg"}))
    .setFooter("Módulo de sugerencias.", client.user.displayAvatarURL())
    message.channel.send(embedDC)
        }
        else if(isNaN(suggestN)){
            const embedDC = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
    .setDescription("Debes proporcionar una ID válida, no letras ni simbolos.")
    .setColor("RANDOM")
    .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpg"}))
    .setFooter("Módulo de sugerencias.", client.user.displayAvatarURL())
    message.channel.send(embedDC)
        }
        else if(!sugerencias_channels.tiene(suggestN)){
            const embedDC = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
    .setDescription("Esa ID no le pertenece a una sugerencia.")
    .setColor("RANDOM")
    .setThumbnail(message.guild.iconURL({dynamic: true, format: "jpg"}))
    .setFooter("Módulo de sugerencias.", client.user.displayAvatarURL())
    message.channel.send(embedDC)
        }
       const canalDNG = await denegadas_channels.obtener(`${message.guild.id}`);
       var suggestADNG = await sugerencias_channels.obtener(`${suggestnueva}`)
       const razonDNG = args.slice(1).join(" ");
       var sugerenciaDNGT = await sugerencias_channels.obtener(`${suggestN}`);
       const embedDNG = new Discord.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true, format: "jpg"}))
      .setDescription(`**Sugerencia denegada:**\n${sugerenciaDNGT}\nSugerencia: ${suggestADNG}\n**Razón:** ${razonDNG ? razonDNG : "No se ha proporcionado una razón."}`)
       client.channels.cache.get(canalDNG).send(embedDNG)
    } else if(command === ("undefined")){
    const undefinedChannel = await indecisas_channels.tiene(message.guild.id) ? indecisas_channels.obtener(message.guild.id) : return;
        const suggestUnd = args[0];
        if(suggestUnd === false){
        return;
        } else if(!suggestUnd){
            return message.channel.send({embed: {
            description: "Proporciona una ID de una sugerencia.",
                color: "RANDOM",
             author: message.author.tag,
                thumbnail: message.guild.iconURL({dynamic: true, format: "jpg"})
            }
          });
        } else if(isNaN(suggestUnd)){
            return message.channel.send("Esa no es una ID válida.");
        }
    }
});
client.on("ready", () => console.log("Yo, "+client.user.username+", acabo de ser iniciado correctamente!"));
client.login(token);
