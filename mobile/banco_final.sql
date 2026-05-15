-- Script SQL Final Consolidado
-- Banco de Dados: bd_comunicacao

CREATE DATABASE IF NOT EXISTS bd_comunicacao;
USE bd_comunicacao;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nome_categoria VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    ordem INT DEFAULT 0
);

-- Tabela de Pictogramas (Falas)
CREATE TABLE IF NOT EXISTS falas (
    id_fala INT PRIMARY KEY AUTO_INCREMENT,
    id_categoria INT NOT NULL,
    texto VARCHAR(255) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    ordem INT DEFAULT 0,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE CASCADE
);

-- Tabela de Histórico de Comunicação (Repositório de Frases)
CREATE TABLE IF NOT EXISTS historico_comunicacao (
    id_historico INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    id_fala INT DEFAULT NULL,
    texto TEXT NOT NULL,
    emoji TEXT,
    tipo VARCHAR(50) DEFAULT 'frase',
    data_uso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabela de Rotinas
CREATE TABLE IF NOT EXISTS rotinas (
    id_rotina INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    horario TIME NOT NULL,
    atividade VARCHAR(255) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabela de Lembretes
CREATE TABLE IF NOT EXISTS lembretes (
    id_lembrete INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    texto VARCHAR(255) NOT NULL,
    feito TINYINT(1) DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabela de Minhas Frases (Atalhos)
CREATE TABLE IF NOT EXISTS frases_atalho (
    id_frase INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    texto TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Inserção de Categorias Iniciais
INSERT IGNORE INTO categorias (id_categoria, nome_categoria, emoji, ordem) VALUES 
(1, 'Comida', '🍔', 1),
(2, 'Perguntas', '💭', 2),
(3, 'Ações', '🏃‍♀️', 3),
(4, 'Sentimento', '😁', 4),
(5, 'Social', '👥', 5),
(6, 'Algo errado', '❌', 6),
(7, 'Afirmação', '✔️', 7),
(8, 'Localização', '📍', 8),
(9, 'Lazer', '🎮', 9);
