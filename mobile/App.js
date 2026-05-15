import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, FlatList, SafeAreaView, StatusBar,
  Platform, KeyboardAvoidingView, ActivityIndicator,
  Animated, LayoutAnimation, UIManager, Dimensions, PixelRatio
} from 'react-native';
import axios from 'axios';
import * as Speech from 'expo-speech';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


const scale = SCREEN_WIDTH / 375;

function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

// Habilitar animações no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─────────────────────────────────────────
// CONFIGURAÇÃO E CORES PASTÉIS
// ─────────────────────────────────────────
const API_URL = 'http://10.239.0.170/tcc_php/';

const C = {
  fundo: '#FDFCF0',      
  primaria: '#BDE0FE',   
  secundaria: '#A2D2FF', 
  destaque: '#FFC8DD',   
  sucesso: '#C1E1C1',    
  erro: '#FFADAD',       
  alerta: '#FDFFB6',     
  roxoSuave: '#CDB4DB',  
  texto: '#4A4A4A',      
  subtexto: '#8D99AE',   
  branco: '#FFFFFF',
  cinza: '#F8F9FA',
  cinzaMedio: '#E0E0E0',
};

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// ─────────────────────────────────────────
// DADOS FIXOS
// ─────────────────────────────────────────
const CATEGORIAS_FIXAS = [
  { id_categoria: 1, nome_categoria: 'Comida', emoji: '🍎', cor: '#FFADAD' },
  { id_categoria: 2, nome_categoria: 'Perguntas', emoji: '❓', cor: '#BDE0FE' },
  { id_categoria: 3, nome_categoria: 'Ações', emoji: '🏃', cor: '#C1E1C1' },
  { id_categoria: 4, nome_categoria: 'Sentimento', emoji: '😊', cor: '#FDFFB6' },
  { id_categoria: 5, nome_categoria: 'Social', emoji: '👋', cor: '#FFC8DD' },
  { id_categoria: 6, nome_categoria: 'Algo errado', emoji: '❌', cor: '#FFB7B2' },
  { id_categoria: 7, nome_categoria: 'Afirmação', emoji: '✅', cor: '#B9FBC0' },
  { id_categoria: 8, nome_categoria: 'Localização', emoji: '🏠', cor: '#A2D2FF' },
  { id_categoria: 9, nome_categoria: 'Lazer', emoji: '🎮', cor: '#CDB4DB' },
];

const PICTOGRAMAS_FIXOS = {
  1: [
    { id: 101, texto: 'Melancia', emoji: '🍉' }, { id: 102, texto: 'Batata frita', emoji: '🍟' }, { id: 103, texto: 'Carne', emoji: '🥩' },
    { id: 104, texto: 'Cenoura', emoji: '🥕' }, { id: 105, texto: 'Milho', emoji: '🌽' }, { id: 106, texto: 'Pipoca', emoji: '🍿' },
    { id: 107, texto: 'Bento', emoji: '🍱' }, { id: 108, texto: 'Ovo', emoji: '🍳' }, { id: 109, texto: 'Donut', emoji: '🍩' },
    { id: 110, texto: 'Chocolate', emoji: '🍫' }, { id: 111, texto: 'Leite', emoji: '🥛' }, { id: 112, texto: 'Suco', emoji: '🧃' },
  ],
  2: [
    { id: 201, texto: 'O que é isso?', emoji: '❓' }, { id: 202, texto: 'Onde está?', emoji: '📍' }, { id: 203, texto: 'Quem escolhe?', emoji: '👤' },
    { id: 204, texto: 'Qual você quer?', emoji: '🤔' }, { id: 205, texto: 'Por que?', emoji: '❔' }, { id: 206, texto: 'Pronto?', emoji: '🏁' },
    { id: 207, texto: 'Está certo?', emoji: '✅' }, { id: 208, texto: 'Quanto falta?', emoji: '⏳' }, { id: 209, texto: 'Onde vamos?', emoji: '🚗' },
    { id: 210, texto: 'Pode pegar?', emoji: '🤲' }, { id: 211, texto: 'Você gosta?', emoji: '❤️' }, { id: 212, texto: 'Você me ajuda?', emoji: '🤝' },
  ],
  3: [
    { id: 301, texto: 'Andar', emoji: '🚶' }, { id: 302, texto: 'Correr', emoji: '🏃' }, { id: 303, texto: 'Ir', emoji: '🚶‍♂️' },
    { id: 304, texto: 'Pegar', emoji: '🤲' }, { id: 305, texto: 'Receber', emoji: '🙌' }, { id: 306, texto: 'Dar', emoji: '💁‍♂️' },
    { id: 307, texto: 'Parar', emoji: '🛑' }, { id: 308, texto: 'Comprar', emoji: '🛍️' }, { id: 309, texto: 'Passear', emoji: '🚗' },
    { id: 310, texto: 'Escolher', emoji: '⁉️' }, { id: 311, texto: 'Sentar', emoji: '🪑' }, { id: 312, texto: 'Sair', emoji: '↩️' },
  ],
  4: [
    { id: 401, texto: 'Estou feliz', emoji: '😊' }, { id: 402, texto: 'Estou triste', emoji: '😢' }, { id: 403, texto: 'Estou alegre', emoji: '😄' },
    { id: 404, texto: 'Estou com sede', emoji: '😫' }, { id: 405, texto: 'Estou cansado', emoji: '😫' }, { id: 406, texto: 'Estou bem', emoji: '🙂' },
    { id: 407, texto: 'Estou mal', emoji: '🙁' }, { id: 408, texto: 'Eu quero ajuda', emoji: '🙋‍♂️' }, { id: 409, texto: 'Estou animado', emoji: '🤩' },
    { id: 410, texto: 'Estou com fome', emoji: '😋' }, { id: 411, texto: 'Estou com frio', emoji: '🥶' }, { id: 412, texto: 'Estou com dor', emoji: '🤕' },
  ],
  5: [
    { id: 501, texto: 'Olá', emoji: '👋' }, { id: 502, texto: 'Tchau', emoji: '👋' }, { id: 503, texto: 'Obrigado', emoji: '🤝' },
    { id: 504, texto: 'Desculpe', emoji: '😔' }, { id: 505, texto: 'Por favor', emoji: '🙏' }, { id: 506, texto: 'Com licença', emoji: '👥' },
    { id: 507, texto: 'Muito prazer', emoji: '🤝' }, { id: 508, texto: 'Saúde', emoji: '🥂' }, { id: 509, texto: 'Como você está?', emoji: '🙋‍♀️' },
    { id: 510, texto: 'Bom dia', emoji: '☀️' }, { id: 511, texto: 'Boa tarde', emoji: '🌤️' }, { id: 512, texto: 'Boa noite', emoji: '🌙' },
  ],
  6: [
    { id: 601, texto: 'Está errado', emoji: '🚫' }, { id: 602, texto: 'Não quero', emoji: '🙅‍♂️' }, { id: 603, texto: 'Pare', emoji: '✋' },
    { id: 604, texto: 'Estou confuso', emoji: '😵' }, { id: 605, texto: 'Estou bravo', emoji: '😡' }, { id: 606, texto: 'Está ruim', emoji: '🤢' },
    { id: 607, texto: 'Está difícil', emoji: '⚒️' }, { id: 608, texto: 'Não gosto', emoji: '👎' }, { id: 609, texto: 'Não entendi', emoji: '❓' },
    { id: 610, texto: 'Onde está errado?', emoji: '⚒️' }, { id: 611, texto: 'Tem um problema', emoji: '⚠️' }, { id: 612, texto: 'Espere', emoji: '⏳' },
  ],
  7: [
    { id: 701, texto: 'Sim', emoji: '✅' }, { id: 702, texto: 'Não', emoji: '❌' }, { id: 703, texto: 'Talvez', emoji: '🤔' },
    { id: 704, texto: 'Está bom', emoji: '👍' }, { id: 705, texto: 'Eu aceito', emoji: '✔️' }, { id: 706, texto: 'Já fiz', emoji: '🔘' },
    { id: 707, texto: 'Eu entendi', emoji: '👈' }, { id: 708, texto: 'Eu quero', emoji: '🤩' }, { id: 709, texto: 'Eu concordo', emoji: '🤝' },
    { id: 710, texto: 'Obrigado(a)', emoji: '🙏' }, { id: 711, texto: 'Quero mais', emoji: '➕' }, { id: 712, texto: 'Eu gosto', emoji: '😋' },
  ],
  8: [
    { id: 801, texto: 'Quero banheiro', emoji: '🚻' }, { id: 802, texto: 'Quero casa', emoji: '🏠' }, { id: 803, texto: 'Quero escola', emoji: '🏫' },
    { id: 804, texto: 'Quero o quarto', emoji: '🛏️' }, { id: 805, texto: 'Quero a sala', emoji: '🛋️' }, { id: 806, texto: 'Quero a cozinha', emoji: '🚪' },
    { id: 807, texto: 'Vamos lá', emoji: '➡️' }, { id: 808, texto: 'Quero rua', emoji: '🪑' }, { id: 809, texto: 'Onde estamos?', emoji: '📍' },
    { id: 810, texto: 'Vamos almoçar', emoji: '🍽️' }, { id: 811, texto: 'Quero ir', emoji: '📌' }, { id: 812, texto: 'Minha casa', emoji: '🏠' },
  ],
  9: [
    { id: 901, texto: 'Quero brincar', emoji: '🧸' }, { id: 902, texto: 'Quero jogar', emoji: '🎮' }, { id: 903, texto: 'Quero música', emoji: '🎵' },
    { id: 904, texto: 'Quero ler', emoji: '📖' }, { id: 905, texto: 'Quero desenhar', emoji: '🎨' }, { id: 906, texto: 'Quero parque', emoji: '🌳' },
    { id: 907, texto: 'Quero TV', emoji: '📺' }, { id: 908, texto: 'Quero cinema', emoji: '🎬' }, { id: 909, texto: 'Quero videogame', emoji: '📺' },
    { id: 910, texto: 'Quero nadar', emoji: '🏊' }, { id: 911, texto: 'Quero pintar', emoji: '✏️' }, { id: 912, texto: 'Quero dormir', emoji: '😴' },
  ],
};

const falarTexto = (texto) => {
  Speech.speak(texto, { language: 'pt-BR', pitch: 1.1, rate: 0.85 });
};

// ─────────────────────────────────────────
// COMPONENTES REUTILIZÁVEIS
// ─────────────────────────────────────────

function TopBar({ titulo, onVoltar, onAcao, iconeAcao, logoMode }) {
  return (
    <View style={s.topBar}>
      {logoMode ? (
        <View style={s.logoWrap}>
          <Image
        style={s.logoEmoji}
        source={require("./assets/image.png")}
      />
          <Text style={s.logoTexto}>M.O.T.I.O.N</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={onVoltar} style={s.topBarBtn}>
          <Text style={s.topBarBtnTxt}>←</Text>
        </TouchableOpacity>
      )}
      {titulo ? <Text style={s.topBarTitulo} numberOfLines={1}>{titulo}</Text> : <View style={{ flex: 1 }} />}
      {onAcao ? (
        <TouchableOpacity onPress={onAcao} style={s.topBarBtn}>
          <Text style={s.topBarBtnTxt}>{iconeAcao || '+'}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: normalize(44) }} />
      )}
    </View>
  );
}

function BotaoVoltar({ onPress }) {
  return (
    <TouchableOpacity style={s.botaoVoltar} onPress={onPress}>
      <Text style={s.botaoVoltarTxt}>Voltar</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────
// TELA LOGIN
// ─────────────────────────────────────────
function TelaLogin({ onLogin, onCadastro }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) { Alert.alert('Atenção', 'Preencha email e senha'); return; }
    setLoading(true);
    try {
      const res = await axios.post(API_URL + 'login.php', { email, senha });
      if (res.data.success) {
        onLogin(res.data.usuario);
      } else {
        Alert.alert('Erro', res.data.message || 'Dados incorretos');
      }
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.primaria }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.primaria} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={s.loginTopo}>
            <Text style={s.loginEmoji}>🧠</Text>
            <Text style={s.loginAppNome}>M.O.T.I.O.N</Text>
          </View>
          <View style={s.loginCard}>
            <Text style={s.loginCardTitulo}>Bem-vindo!</Text>
            <Text style={s.loginLabel}>EMAIL</Text>
            <TextInput style={s.loginInput} placeholder="seu@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={s.loginLabel}>SENHA</Text>
            <TextInput style={s.loginInput} placeholder="******" value={senha} onChangeText={setSenha} secureTextEntry />
            <TouchableOpacity style={s.loginBotao} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color={C.branco} /> : <Text style={s.loginBotaoTxt}>Entrar</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={onCadastro} style={{ marginTop: normalize(25), alignItems: 'center' }}>
              <Text style={s.loginLink}>Criar uma conta nova</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// TELA CADASTRO
// ─────────────────────────────────────────
function TelaCadastro({ onVoltar }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [nomeDep, setNomeDep] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha) { Alert.alert('Erro', 'Preencha os campos obrigatórios'); return; }
    if (senha !== confirmar) { Alert.alert('Erro', 'As senhas não coincidem'); return; }
    setLoading(true);
    try {
      const res = await axios.post(API_URL + 'cadastrar.php', { nome, email, senha, nome_dependente: nomeDep });
      if (res.data.success) {
        Alert.alert('Sucesso! ✨', 'Cadastro realizado!', [{ text: 'OK', onPress: onVoltar }]);
      } else {
        Alert.alert('Erro', res.data.message);
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha na conexão');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.fundo }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.primaria} />
      <View style={s.cadastroHeader}><Text style={s.cadastroHeaderTitulo}>Novo Cadastro</Text></View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.cadastroScroll}>
          <Text style={s.cadastroLabel}>EMAIL *</Text>
          <TextInput style={s.cadastroInput} placeholder="seu@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Text style={s.cadastroLabel}>NOME *</Text>
          <TextInput style={s.cadastroInput} placeholder="Seu nome completo" value={nome} onChangeText={setNome} />
          <Text style={s.cadastroLabel}>SENHA *</Text>
          <TextInput style={s.cadastroInput} placeholder="Mínimo 6 caracteres" value={senha} onChangeText={setSenha} secureTextEntry />
          <Text style={s.cadastroLabel}>CONFIRMAR SENHA *</Text>
          <TextInput style={s.cadastroInput} placeholder="Repita a senha" value={confirmar} onChangeText={setConfirmar} secureTextEntry />
          <Text style={s.cadastroLabel}>NOME DO DEPENDENTE</Text>
          <TextInput style={s.cadastroInput} placeholder="Nome da criança" value={nomeDep} onChangeText={setNomeDep} />
          <TouchableOpacity style={s.cadastroBotao} onPress={handleCadastro} disabled={loading}>
            {loading ? <ActivityIndicator color={C.branco} /> : <Text style={s.cadastroBotaoTxt}>Salvar</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <BotaoVoltar onPress={onVoltar} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// TELA MENU
// ─────────────────────────────────────────
function TelaMenu({ usuario, onNavegar, onLogout }) {
  const cards = [
    { tela: 'comunicacao', emoji: '💬', label: 'Comunicação', cor: C.primaria },
    { tela: 'frases', emoji: '⭐', label: 'Favoritos', cor: C.destaque },
    { tela: 'rotinas', emoji: '📅', label: 'Agenda', cor: C.sucesso },
    { tela: 'lembrete', emoji: '🔔', label: 'Lembrete', cor: C.alerta },
    { tela: 'historico', emoji: '🕐', label: 'Histórico', cor: C.roxoSuave },
    { tela: 'configuracoes', emoji: '⚙️', label: 'Ajustes', cor: C.cinzaMedio },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.fundo }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.primaria} />
      <TopBar logoMode onAcao={onLogout} iconeAcao="🚪" />
      <View style={{ padding: normalize(20), alignItems: 'center' }}>
        <Text style={{ fontSize: normalize(22), fontWeight: 'bold', color: C.texto }}>Olá, {usuario?.nome}! ✨</Text>
      </View>
      <ScrollView contentContainerStyle={s.menuScroll}>
        <View style={s.menuGrid}>
          {cards.map(c => (
            <TouchableOpacity key={c.tela} style={[s.menuCard, { backgroundColor: c.cor }]} onPress={() => onNavegar(c.tela)} activeOpacity={0.7}>
              <Text style={s.menuCardEmoji}>{c.emoji}</Text>
              <Text style={s.menuCardLabel}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// TELA COMUNICAÇÃO (Categorias)
// ─────────────────────────────────────────
function TelaComunicacao({ onVoltar, onCategoria, visibilidade, toggleVisibilidade }) {
  const [modoEdicao, setModoEdicao] = useState(false);

  const handlePress = (cat) => {
    if (modoEdicao) toggleVisibilidade('cat', cat.id_categoria);
    else { falarTexto(cat.nome_categoria); onCategoria(cat); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.fundo }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.primaria} />
      <TopBar titulo="COMUNICAÇÃO" onVoltar={onVoltar} onAcao={() => setModoEdicao(!modoEdicao)} iconeAcao={modoEdicao ? "✅" : "⚙️"} />
      {modoEdicao && <View style={s.editAviso}><Text style={s.editAvisoTxt}>Toque para ocultar/mostrar</Text></View>}
      <ScrollView contentContainerStyle={s.catScroll}>
        <View style={s.catGrid}>
          {CATEGORIAS_FIXAS.map(cat => {
            const visivel = visibilidade[`cat_${cat.id_categoria}`] !== false;
            if (!modoEdicao && !visivel) return null;
            return (
              <TouchableOpacity key={cat.id_categoria} style={[s.catCard, { backgroundColor: cat.cor }, !visivel && s.cardInvisivel]} onPress={() => handlePress(cat)} activeOpacity={0.7}>
                <Text style={s.catEmoji}>{cat.emoji}</Text>
                <Text style={s.catLabel}>{cat.nome_categoria}</Text>
                {modoEdicao && <View style={[s.eyeIcon, { backgroundColor: visivel ? C.sucesso : C.erro }]}><Text style={s.eyeTxt}>{visivel ? '👁️' : '✕'}</Text></View>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <BotaoVoltar onPress={onVoltar} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// TELA PICTOGRAMAS
// ─────────────────────────────────────────
function TelaCategoria({ usuario, categoria, onVoltar, fraseAtual, setFraseAtual, visibilidade, toggleVisibilidade }) {
  const [modoEdicao, setModoEdicao] = useState(false);
  const falas = PICTOGRAMAS_FIXOS[categoria.id_categoria] || [];

  const handlePicto = (item) => {
    if (modoEdicao) toggleVisibilidade('picto', item.id);
    else {
      falarTexto(item.texto);
      setFraseAtual([...fraseAtual, item]);
    }
  };

  const falarFrase = async () => {
    const texto = fraseAtual.map(p => p.texto).join(' ');
    const emojis = fraseAtual.map(p => p.emoji || '💬').join(' ');
    falarTexto(texto);
    try {
      await axios.post(API_URL + 'falas.php', { id_usuario: usuario?.id_usuario, texto, emoji: emojis, tipo: 'frase' });
    } catch (e) {}
    setFraseAtual([]);
  };

  const salvarFavorita = async () => {
    const texto = fraseAtual.map(p => p.texto).join(' ');
    if (!texto) return;
    try {
      await axios.post(API_URL + 'frases.php', { usuario_id: usuario?.id_usuario, texto });
      Alert.alert("Sucesso! ✨", "Frase salva nos favoritos!");
      setFraseAtual([]);
    } catch (e) { Alert.alert("Erro", "Falha ao salvar"); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.fundo }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.primaria} />
      <TopBar titulo={categoria.nome_categoria.toUpperCase()} onVoltar={onVoltar} onAcao={() => setModoEdicao(!modoEdicao)} iconeAcao={modoEdicao ? "✅" : "⚙️"} />
      
      <View style={s.falaBarMaster}>
        {fraseAtual.length > 0 ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', gap: normalize(10) }}>
                {fraseAtual.map((p, i) => (
                  <View key={i} style={s.fraseEmojiBox}><Text style={{ fontSize: normalize(24) }}>{p.emoji}</Text></View>
                ))}
              </View>
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: normalize(8), marginLeft: normalize(10) }}>
              <TouchableOpacity style={[s.falaBarBtn, {backgroundColor: C.sucesso}]} onPress={falarFrase}><Text style={s.falaBarBtnTxt}>🔊</Text></TouchableOpacity>
              <TouchableOpacity style={[s.falaBarBtn, {backgroundColor: C.destaque}]} onPress={salvarFavorita}><Text style={s.falaBarBtnTxt}>⭐</Text></TouchableOpacity>
              <TouchableOpacity style={[s.falaBarBtn, {backgroundColor: C.alerta}]} onPress={() => setFraseAtual(fraseAtual.slice(0, -1))}><Text style={s.falaBarBtnTxt}>↶</Text></TouchableOpacity>
              <TouchableOpacity style={[s.falaBarBtn, {backgroundColor: C.erro}]} onPress={() => setFraseAtual([])}><Text style={s.falaBarBtnTxt}>✕</Text></TouchableOpacity>
            </View>
          </>
        ) : <Text style={s.falaBarTxt}>Toque nos desenhos para falar...</Text>}
      </View>

      {modoEdicao && <View style={s.editAviso}><Text style={s.editAvisoTxt}>Toque para ocultar/mostrar</Text></View>}

      <ScrollView contentContainerStyle={s.pictoScroll}>
        <View style={s.pictoGrid}>
          {falas.map(f => {
            const visivel = visibilidade[`picto_${f.id}`] !== false;
            if (!modoEdicao && !visivel) return null;
            return (
              <TouchableOpacity key={f.id} style={[s.pictoCard, !visivel && s.cardInvisivel]} onPress={() => handlePicto(f)} activeOpacity={0.7}>
                <Text style={s.pictoEmoji}>{f.emoji}</Text>
                <Text style={s.pictoLabel}>{f.texto}</Text>
                {modoEdicao && <View style={[s.eyeIconSmall, { backgroundColor: visivel ? C.sucesso : C.erro }]}><Text style={s.eyeTxtSmall}>{visivel ? '👁️' : '✕'}</Text></View>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <BotaoVoltar onPress={onVoltar} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// TELA ROTINAS
// ─────────────────────────────────────────
function TelaRotinas({ usuario, onVoltar }) {
  const [dia, setDia] = useState('Segunda');
  const [rotinas, setRotinas] = useState([]);
  const [novaAtiv, setNovaAtiv] = useState('');
  const [novoHorario, setNovoHorario] = useState('');
  const [loading, setLoading] = useState(false);

  const carregar = () => {
    setLoading(true);
    axios.get(API_URL + 'rotinas.php', { params: { usuario_id: usuario?.id_usuario, dia_semana: dia } })
      .then(r => { if (r.data.success) setRotinas(r.data.rotinas); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, [dia]);

  const adicionar = async () => {
    if (!novaAtiv) return;
    try {
      await axios.post(API_URL + 'rotinas.php', { usuario_id: usuario?.id_usuario, dia_semana: dia, atividade: novaAtiv, horario: novoHorario || '09:00' });
      setNovaAtiv(''); setNovoHorario(''); carregar();
    } catch {}
  };

  const deletar = async (id) => {
    try {
      await axios.delete(API_URL + 'rotinas.php', { data: { id_rotina: id } });
      carregar();
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.fundo }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.primaria} />
      <TopBar titulo="MINHA AGENDA" onVoltar={onVoltar} />
      
      <View style={s.diasRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: normalize(10) }}>
          {DIAS.map(d => (
            <TouchableOpacity key={d} onPress={() => setDia(d)} style={[s.diaBotao, dia === d && s.diaBotaoAtivo]}>
              <Text style={[s.diaBotaoTxt, dia === d && s.diaBotaoTxtAtivo]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={s.agendaInputContainer}>
        <View style={s.inputRow}>
          <TextInput style={[s.inputField, { flex: 3 }]} placeholder="O que vamos fazer?" value={novaAtiv} onChangeText={setNovaAtiv} />
          <TextInput style={[s.inputField, { flex: 1.5 }]} placeholder="00:00" value={novoHorario} onChangeText={setNovoHorario} />
          <TouchableOpacity style={s.addBotao} onPress={adicionar}><Text style={s.addBotaoTxt}>+</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: normalize(16), flexGrow: 1 }}>
        {loading ? <ActivityIndicator color={C.secundaria} style={{marginTop: 20}} /> :
          rotinas.map(r => (
            <View key={r.id_rotina} style={s.rotinaItem}>
              <Text style={s.rotinaHorario}>{r.horario?.substring(0,5)}</Text>
              <Text style={s.rotinaTexto}>{r.atividade}</Text>
              <TouchableOpacity onPress={() => deletar(r.id_rotina)}><Text style={s.rotinaDelete}>×</Text></TouchableOpacity>
            </View>
          ))
        }
        {!loading && rotinas.length === 0 && <Text style={s.vazio}>Nada agendado para hoje! 🎈</Text>}
      </ScrollView>
      <BotaoVoltar onPress={onVoltar} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// TELA LEMBRETES
// ─────────────────────────────────────────
function TelaLembretes({ usuario, onVoltar }) {
  const [lembretes, setLembretes] = useState([]);
  const [novoLembrete, setNovoLembrete] = useState('');
  const [loading, setLoading] = useState(false);

  const carregar = () => {
    setLoading(true);
    axios.get(API_URL + 'lembretes.php', { params: { usuario_id: usuario?.id_usuario } })
      .then(r => { if (r.data.success) setLembretes(r.data.lembretes); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const adicionar = async () => {
    if (!novoLembrete) return;
    try {
      await axios.post(API_URL + 'lembretes.php', { usuario_id: usuario?.id_usuario, texto: novoLembrete });
      setNovoLembrete(''); carregar();
    } catch {}
  };

  const toggleFeito = async (item) => {
    try {
      await axios.put(API_URL + 'lembretes.php', { id_lembrete: item.id_lembrete, feito: !item.feito });
      carregar();
    } catch {}
  };

  const deletar = async (id) => {
    try {
      await axios.delete(API_URL + 'lembretes.php', { data: { id_lembrete: id } });
      carregar();
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.fundo }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.primaria} />
      <TopBar titulo="MEUS LEMBRETES" onVoltar={onVoltar} />
      
      <View style={s.agendaInputContainer}>
        <View style={s.inputRow}>
          <TextInput style={[s.inputField, { flex: 1 }]} placeholder="Lembrar de..." value={novoLembrete} onChangeText={setNovoLembrete} />
          <TouchableOpacity style={s.addBotao} onPress={adicionar}><Text style={s.addBotaoTxt}>+</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: normalize(16) }}>
        {loading ? <ActivityIndicator color={C.secundaria} /> :
          lembretes.map(item => (
            <View key={item.id_lembrete} style={[s.lembreteItem, item.feito && s.lembreteFeito]}>
              <TouchableOpacity style={s.checkbox} onPress={() => toggleFeito(item)}>
                {item.feito && <Text style={{color: C.branco, fontWeight: 'bold'}}>✓</Text>}
              </TouchableOpacity>
              <Text style={[s.lembreteTexto, item.feito && s.lembreteTextoFeito]}>{item.texto}</Text>
              <TouchableOpacity onPress={() => deletar(item.id_lembrete)}><Text style={s.rotinaDelete}>×</Text></TouchableOpacity>
            </View>
          ))
        }
        {!loading && lembretes.length === 0 && <Text style={s.vazio}>Nenhum lembrete por enquanto! 🔔</Text>}
      </ScrollView>
      <BotaoVoltar onPress={onVoltar} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// TELA FRASES SALVAS
// ─────────────────────────────────────────
function TelaFrases({ usuario, onVoltar }) {
  const [frases, setFrases] = useState([]);
  const carregar = () => {
    axios.get(API_URL + 'frases.php', { params: { usuario_id: usuario?.id_usuario } })
      .then(r => { if (r.data.success) setFrases(r.data.frases); })
      .catch(() => {});
  };
  useEffect(() => { carregar(); }, []);
  const deletar = async (id) => {
    try {
      await axios.delete(API_URL + 'frases.php', { data: { id_frase: id } });
      carregar();
    } catch {}
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.fundo }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.primaria} />
      <TopBar titulo="MEUS FAVORITOS" onVoltar={onVoltar} />
      <ScrollView contentContainerStyle={{ padding: normalize(16) }}>
        {frases.map(f => (
          <View key={f.id_frase} style={s.histItem}>
            <TouchableOpacity style={{flex: 1}} onPress={() => falarTexto(f.texto)}>
              <Text style={s.histTxt}>{f.texto}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deletar(f.id_frase)}><Text style={{fontSize: normalize(24)}}>🗑️</Text></TouchableOpacity>
          </View>
        ))}
        {frases.length === 0 && <Text style={s.vazio}>Salve suas frases favoritas aqui! ⭐</Text>}
      </ScrollView>
      <BotaoVoltar onPress={onVoltar} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// TELA HISTÓRICO
// ─────────────────────────────────────────
function TelaHistorico({ usuario, onVoltar }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregar = () => {
    setLoading(true);
    axios.get(API_URL + 'historico.php', { params: { usuario_id: usuario?.id_usuario } })
      .then(r => { if (r.data.success) setHistorico(r.data.historico); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.fundo }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.primaria} />
      <TopBar titulo="O QUE EU DISSE" onVoltar={onVoltar} />
      <ScrollView contentContainerStyle={{ padding: normalize(16) }}>
        {loading ? <ActivityIndicator color={C.secundaria} /> :
          historico.map((h, i) => (
            <TouchableOpacity key={i} style={s.histItem} onPress={() => falarTexto(h.texto)}>
              <Text style={s.histEmoji}>{h.emoji?.split(' ')[0] || '💬'}</Text>
              <View style={{flex: 1}}>
                <Text style={s.histTxt}>{h.texto}</Text>
                <Text style={s.histHora}>{h.data_uso}</Text>
              </View>
            </TouchableOpacity>
          ))
        }
        {!loading && historico.length === 0 && <Text style={s.vazio}>Nenhuma fala registrada ainda. 🗣️</Text>}
      </ScrollView>
      <BotaoVoltar onPress={onVoltar} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────
export default function App() {
  const [tela, setTela] = useState('login');
  const [usuario, setUsuario] = useState(null);
  const [categoriaAtual, setCategoriaAtual] = useState(null);
  const [fraseAtual, setFraseAtual] = useState([]);
  const [visibilidade, setVisibilidade] = useState({});

  const login = (u) => { setUsuario(u); setTela('menu'); };
  const logout = () => { setUsuario(null); setTela('login'); };
  const ir = (t) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setTela(t); };

  const toggleVisibilidade = (tipo, id) => {
    const chave = `${tipo}_${id}`;
    setVisibilidade(prev => ({ ...prev, [chave]: prev[chave] === false }));
  };

  if (tela === 'login') return <TelaLogin onLogin={login} onCadastro={() => ir('cadastro')} />;
  if (tela === 'cadastro') return <TelaCadastro onVoltar={() => ir('login')} />;
  if (tela === 'menu') return <TelaMenu usuario={usuario} onNavegar={ir} onLogout={logout} />;
  if (tela === 'comunicacao') return <TelaComunicacao onVoltar={() => ir('menu')} onCategoria={(cat) => { setCategoriaAtual(cat); ir('categoria'); }} visibilidade={visibilidade} toggleVisibilidade={toggleVisibilidade} />;
  if (tela === 'categoria' && categoriaAtual) return <TelaCategoria usuario={usuario} categoria={categoriaAtual} onVoltar={() => ir('comunicacao')} fraseAtual={fraseAtual} setFraseAtual={setFraseAtual} visibilidade={visibilidade} toggleVisibilidade={toggleVisibilidade} />;
  if (tela === 'rotinas') return <TelaRotinas usuario={usuario} onVoltar={() => ir('menu')} />;
  if (tela === 'lembrete') return <TelaLembretes usuario={usuario} onVoltar={() => ir('menu')} />;
  if (tela === 'frases') return <TelaFrases usuario={usuario} onVoltar={() => ir('menu')} />;
  if (tela === 'historico') return <TelaHistorico usuario={usuario} onVoltar={() => ir('menu')} />;
  if (tela === 'configuracoes') return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.fundo}}><Text style={{fontSize: normalize(18), color: C.texto}}>Ajustes em breve! 🛠️</Text><BotaoVoltar onPress={() => ir('menu')} /></View>;
  return null;
}

// ─────────────────────────────────────────
// ESTILOS RESPONSIVOS
// ─────────────────────────────────────────
const s = StyleSheet.create({
  topBar: { backgroundColor: C.primaria, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: normalize(16), paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + normalize(10) : normalize(16), paddingBottom: normalize(16), borderBottomLeftRadius: normalize(25), borderBottomRightRadius: normalize(25) },
  topBarBtn: { width: normalize(44), height: normalize(44), backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: normalize(22), alignItems: 'center', justifyContent: 'center' },
  topBarBtnTxt: { fontSize: normalize(22), color: C.texto, fontWeight: 'bold' },
  topBarTitulo: { fontSize: normalize(18), fontWeight: '900', color: C.texto, flex: 1, textAlign: 'center', letterSpacing: 1 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: normalize(8) },
  logoEmoji: {
  width: 60,
  height: 60,
  resizeMode: 'contain',
},
  logoTexto: { fontSize: normalize(20), fontWeight: '900', color: C.texto },
  botaoVoltar: { backgroundColor: C.primaria, paddingVertical: normalize(18), alignItems: 'center', borderTopLeftRadius: normalize(25), borderTopRightRadius: normalize(25) },
  botaoVoltarTxt: { color: C.texto, fontWeight: '900', fontSize: normalize(16), letterSpacing: 1 },
  loginTopo: { alignItems: 'center', paddingTop: normalize(50), paddingBottom: normalize(30) },
  loginEmoji: { fontSize: normalize(80) },
  loginAppNome: { fontSize: normalize(36), fontWeight: '900', color: C.texto, marginTop: normalize(10), letterSpacing: 2 },
  loginCard: { flex: 1, backgroundColor: C.branco, borderTopLeftRadius: normalize(40), borderTopRightRadius: normalize(40), padding: normalize(30), shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  loginCardTitulo: { fontSize: normalize(26), fontWeight: '900', color: C.texto, marginBottom: normalize(30), textAlign: 'center' },
  loginLabel: { fontSize: normalize(12), fontWeight: '900', color: C.subtexto, marginBottom: normalize(8), marginLeft: normalize(5) },
  loginInput: { borderRadius: normalize(20), paddingHorizontal: normalize(20), paddingVertical: normalize(15), fontSize: normalize(16), backgroundColor: C.cinza, marginBottom: normalize(20), color: C.texto },
  loginBotao: { backgroundColor: C.secundaria, borderRadius: normalize(25), paddingVertical: normalize(18), alignItems: 'center', marginTop: normalize(10), elevation: 4 },
  loginBotaoTxt: { fontSize: normalize(18), fontWeight: '900', color: C.branco, letterSpacing: 1 },
  loginLink: { color: C.subtexto, fontSize: normalize(14), fontWeight: '700', textDecorationLine: 'underline' },
  cadastroHeader: { backgroundColor: C.primaria, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + normalize(20) : normalize(60), paddingBottom: normalize(20), paddingHorizontal: normalize(25), borderBottomLeftRadius: normalize(30), borderBottomRightRadius: normalize(30) },
  cadastroHeaderTitulo: { fontSize: normalize(24), fontWeight: '900', color: C.texto },
  cadastroScroll: { padding: normalize(25) },
  cadastroLabel: { fontSize: normalize(12), fontWeight: '900', color: C.subtexto, marginBottom: normalize(8), marginTop: normalize(5) },
  cadastroInput: { borderRadius: normalize(20), paddingHorizontal: normalize(20), paddingVertical: normalize(15), fontSize: normalize(16), backgroundColor: C.cinza, marginBottom: normalize(15), color: C.texto },
  cadastroBotao: { backgroundColor: C.sucesso, borderRadius: normalize(25), paddingVertical: normalize(18), alignItems: 'center', marginTop: normalize(15), marginBottom: normalize(10), elevation: 3 },
  cadastroBotaoTxt: { fontSize: normalize(18), fontWeight: '900', color: C.branco },
  menuScroll: { padding: normalize(20) },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(16), justifyContent: 'space-between' },
  menuCard: { width: '47%', borderRadius: normalize(30), paddingVertical: normalize(30), alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
  menuCardEmoji: { fontSize: normalize(45), marginBottom: normalize(12) },
  menuCardLabel: { fontSize: normalize(16), fontWeight: '900', color: C.texto, textAlign: 'center' },
  catScroll: { padding: normalize(16) },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(14), justifyContent: 'space-between' },
  catCard: { width: '30%', borderRadius: normalize(25), paddingVertical: normalize(20), alignItems: 'center', gap: normalize(10), elevation: 3 },
  catEmoji: { fontSize: normalize(35) },
  catLabel: { fontSize: normalize(12), fontWeight: '900', color: C.texto, textAlign: 'center' },
  falaBarMaster: { backgroundColor: C.branco, margin: normalize(15), borderRadius: normalize(30), padding: normalize(15), minHeight: normalize(100), flexDirection: 'row', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  falaBarTxt: { color: C.subtexto, fontSize: normalize(16), fontStyle: 'italic', flex: 1, textAlign: 'center', fontWeight: '600' },
  falaBarBtn: { width: normalize(48), height: normalize(48), borderRadius: normalize(24), alignItems: 'center', justifyContent: 'center', elevation: 4 },
  falaBarBtnTxt: { fontSize: normalize(20) },
  fraseEmojiBox: { backgroundColor: C.fundo, padding: normalize(8), borderRadius: normalize(15), elevation: 2 },
  pictoScroll: { padding: normalize(14) },
  pictoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: normalize(12), justifyContent: 'space-between' },
  pictoCard: { width: '30%', backgroundColor: C.branco, borderRadius: normalize(25), paddingVertical: normalize(20), paddingHorizontal: normalize(5), alignItems: 'center', gap: normalize(8), elevation: 3 },
  pictoEmoji: { fontSize: normalize(40) },
  pictoLabel: { fontSize: normalize(11), fontWeight: '900', color: C.texto, textAlign: 'center' },
  eyeIcon: { position: 'absolute', top: normalize(8), right: normalize(8), width: normalize(28), height: normalize(28), borderRadius: normalize(14), alignItems: 'center', justifyContent: 'center', elevation: 2 },
  eyeIconSmall: { position: 'absolute', top: normalize(5), right: normalize(5), width: normalize(22), height: normalize(22), borderRadius: normalize(11), alignItems: 'center', justifyContent: 'center', elevation: 2 },
  eyeTxt: { color: '#FFF', fontSize: normalize(14) },
  eyeTxtSmall: { color: '#FFF', fontSize: normalize(12) },
  cardInvisivel: { opacity: 0.4, backgroundColor: '#E0E0E0' },
  editAviso: { backgroundColor: C.roxoSuave, padding: normalize(10), marginHorizontal: normalize(25), borderRadius: normalize(15), marginBottom: normalize(10) },
  editAvisoTxt: { color: C.branco, textAlign: 'center', fontSize: normalize(13), fontWeight: '900' },
  diasRow: { backgroundColor: 'transparent', height: normalize(60), marginBottom: normalize(10) },
  diaBotao: { paddingHorizontal: normalize(18), paddingVertical: normalize(10), borderRadius: normalize(25), backgroundColor: C.branco, borderWidth: 2, borderColor: C.primaria, marginHorizontal: normalize(6), height: normalize(45), justifyContent: 'center' },
  diaBotaoAtivo: { backgroundColor: C.primaria, borderColor: C.primaria },
  diaBotaoTxt: { color: C.texto, fontWeight: '900', fontSize: normalize(14) },
  diaBotaoTxtAtivo: { color: C.branco },
  agendaInputContainer: { paddingHorizontal: normalize(16), marginBottom: normalize(10) },
  inputRow: { flexDirection: 'row', gap: normalize(8), alignItems: 'center' },
  inputField: { borderRadius: normalize(20), paddingHorizontal: normalize(15), paddingVertical: normalize(12), backgroundColor: C.branco, fontSize: normalize(14), color: C.texto, elevation: 2, height: normalize(50) },
  addBotao: { width: normalize(50), height: normalize(50), backgroundColor: C.sucesso, borderRadius: normalize(25), alignItems: 'center', justifyContent: 'center', elevation: 4 },
  addBotaoTxt: { color: C.branco, fontSize: normalize(28), fontWeight: '900' },
  rotinaItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.secundaria, borderRadius: normalize(20), padding: normalize(15), marginBottom: normalize(10), gap: normalize(12), elevation: 2 },
  rotinaHorario: { fontSize: normalize(14), color: C.branco, fontWeight: '900', minWidth: normalize(50) },
  rotinaTexto: { color: C.branco, fontWeight: '900', fontSize: normalize(15), flex: 1 },
  rotinaDelete: { color: C.erro, fontSize: normalize(24), fontWeight: '900', padding: normalize(5) },
  lembreteItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.branco, borderRadius: normalize(20), padding: normalize(15), marginBottom: normalize(10), gap: normalize(12), elevation: 2 },
  lembreteFeito: { opacity: 0.6, backgroundColor: C.cinzaMedio },
  checkbox: { width: normalize(28), height: normalize(28), borderRadius: normalize(14), borderWidth: 2, borderColor: C.secundaria, alignItems: 'center', justifyContent: 'center', backgroundColor: C.branco },
  lembreteTexto: { fontSize: normalize(16), fontWeight: '900', color: C.texto, flex: 1 },
  lembreteTextoFeito: { textDecorationLine: 'line-through', color: C.subtexto },
  histItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.branco, borderRadius: normalize(25), padding: normalize(18), marginBottom: normalize(12), gap: normalize(15), elevation: 3 },
  histEmoji: { fontSize: normalize(35) },
  histTxt: { fontSize: normalize(17), fontWeight: '900', color: C.texto },
  histHora: { fontSize: normalize(12), color: C.subtexto, fontWeight: '700' },
  vazio: { textAlign: 'center', color: C.subtexto, fontWeight: '900', marginTop: normalize(50), fontSize: normalize(16) },
});