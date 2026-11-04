"use client";

import { useMemo, useState } from "react";
import initialQuestions from "../data/questoes.json";
import initialResponses from "../data/respostas.json";

const iconPaths = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  book: "M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z M4 4.5v17 M8 6h8 M8 10h8",
  users: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 8v6 M23 11h-6",
  chart: "M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3",
  search: "m21 21-4.3-4.3 M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z",
  plus: "M12 5v14 M5 12h14",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  check: "m5 12 4 4L19 6",
  close: "m18 6-12 12 M6 6l12 12",
  sparkle: "m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z M19 14l1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z",
  clock: "M12 8v4l2.5 2.5 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  more: "M5 12h.01 M12 12h.01 M19 12h.01",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8",
};

function Icon({ name, size = 18, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

function StatusBadge({ status }) {
  const isReviewed = status === "revisada";
  return (
    <span className={`status-badge ${isReviewed ? "reviewed" : "pending"}`}>
      <span className="status-dot" />
      {isReviewed ? "Revisada" : "Pendente"}
    </span>
  );
}

function StatCard({ label, value, note, icon, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} size={19} />
      </div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function NewQuestionModal({ onClose, onCreate }) {
  const [values, setValues] = useState({
    disciplina: "",
    turma: "",
    enunciado: "",
    respostaEsperada: "",
    criterios: "",
    notaMaxima: "4",
  });
  const [errors, setErrors] = useState({});

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function submitForm(event) {
    event.preventDefault();
    const nextErrors = {};
    ["disciplina", "turma", "enunciado", "respostaEsperada", "criterios"].forEach(
      (field) => {
        if (!values[field].trim()) nextErrors[field] = "Preencha este campo.";
      },
    );
    const score = Number(values.notaMaxima);
    if (!Number.isFinite(score) || score <= 0 || score > 10) {
      nextErrors.notaMaxima = "Informe uma nota entre 0,1 e 10.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onCreate({
      ...values,
      id: `q-${Date.now()}`,
      notaMaxima: score,
      criterios: values.criterios
        .split("\n")
        .map((criterion) => criterion.trim())
        .filter(Boolean),
    });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        className="modal-card"
        role="dialog"
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">NOVA AVALIAÇÃO</span>
            <h2 id="modal-title">Cadastre uma questão</h2>
            <p>Defina o que será avaliado para orientar a correção assistida.</p>
          </div>
          <button aria-label="Fechar" className="icon-button" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>
        <form className="question-form" noValidate onSubmit={submitForm}>
          <div className="form-row">
            <label>
              Disciplina
              <input
                aria-invalid={Boolean(errors.disciplina)}
                name="disciplina"
                onChange={updateField}
                placeholder="Ex.: História"
                value={values.disciplina}
              />
              {errors.disciplina && <span className="field-error">{errors.disciplina}</span>}
            </label>
            <label>
              Turma
              <input
                aria-invalid={Boolean(errors.turma)}
                name="turma"
                onChange={updateField}
                placeholder="Ex.: 8º ano A"
                value={values.turma}
              />
              {errors.turma && <span className="field-error">{errors.turma}</span>}
            </label>
          </div>
          <label>
            Enunciado da questão
            <textarea
              aria-invalid={Boolean(errors.enunciado)}
              name="enunciado"
              onChange={updateField}
              placeholder="O que os alunos devem responder?"
              rows={2}
              value={values.enunciado}
            />
            {errors.enunciado && <span className="field-error">{errors.enunciado}</span>}
          </label>
          <label>
            Resposta esperada
            <textarea
              aria-invalid={Boolean(errors.respostaEsperada)}
              name="respostaEsperada"
              onChange={updateField}
              placeholder="Descreva os elementos de uma resposta completa."
              rows={3}
              value={values.respostaEsperada}
            />
            {errors.respostaEsperada && <span className="field-error">{errors.respostaEsperada}</span>}
          </label>
          <div className="form-row criteria-row">
            <label>
              Critérios de correção
              <textarea
                aria-invalid={Boolean(errors.criterios)}
                name="criterios"
                onChange={updateField}
                placeholder={"Um critério por linha\nEx.: Cita duas causas"}
                rows={3}
                value={values.criterios}
              />
              {errors.criterios && <span className="field-error">{errors.criterios}</span>}
            </label>
            <label>
              Nota máxima
              <input
                aria-invalid={Boolean(errors.notaMaxima)}
                max="10"
                min="0.1"
                name="notaMaxima"
                onChange={updateField}
                step="0.1"
                type="number"
                value={values.notaMaxima}
              />
              {errors.notaMaxima && <span className="field-error">{errors.notaMaxima}</span>}
            </label>
          </div>
          <div className="form-note">
            <Icon name="sparkle" size={16} />
            A sugestão de nota sempre poderá ser revisada pelo professor.
          </div>
          <div className="modal-actions">
            <button className="button button-quiet" onClick={onClose} type="button">Cancelar</button>
            <button className="button button-primary" type="submit">
              <Icon name="plus" size={17} /> Salvar questão
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Home() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [responses, setResponses] = useState(initialResponses);
  const [activeResponseId, setActiveResponseId] = useState(initialResponses[0]?.id);
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const questionById = useMemo(
    () => Object.fromEntries(questions.map((question) => [question.id, question])),
    [questions],
  );
  const activeResponse = responses.find((response) => response.id === activeResponseId);
  const activeQuestion = activeResponse ? questionById[activeResponse.questaoId] : null;
  const pendingCount = responses.filter((response) => response.status === "pendente").length;
  const reviewedCount = responses.length - pendingCount;

  const filteredResponses = responses.filter((response) => {
    const question = questionById[response.questaoId];
    const matchesStatus =
      activeFilter === "Todas" ||
      (activeFilter === "Pendentes" && response.status === "pendente") ||
      (activeFilter === "Revisadas" && response.status === "revisada");
    const query = search.trim().toLocaleLowerCase("pt-BR");
    const matchesSearch =
      !query ||
      [response.aluno, response.turma, question?.disciplina, question?.enunciado]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(query));
    return matchesStatus && matchesSearch;
  });

  function createQuestion(question) {
    setQuestions((current) => [question, ...current]);
    setIsModalOpen(false);
    setNotice("Questão cadastrada com sucesso. Os dados ficam disponíveis nesta demonstração.");
  }

  function approveResponse() {
    if (!activeResponse) return;
    setResponses((current) =>
      current.map((response) =>
        response.id === activeResponse.id ? { ...response, status: "revisada" } : response,
      ),
    );
    setNotice(`Correção de ${activeResponse.aluno} marcada como revisada.`);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a aria-label="Clareia - início" className="brand" href="#">
          <span className="brand-mark"><Icon name="sparkle" size={20} /></span>
          <span>clareia<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-label">ESPAÇO DO PROFESSOR</div>
        <nav aria-label="Navegação principal" className="sidebar-nav">
          <a className="nav-item active" href="#painel"><Icon name="grid" /> Painel</a>
          <a className="nav-item" href="#questoes"><Icon name="book" /> Questões <span className="nav-count">{questions.length}</span></a>
          <a className="nav-item" href="#respostas"><Icon name="users" /> Respostas</a>
          <a className="nav-item" href="#resumo"><Icon name="chart" /> Resumo</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Icon name="sparkle" size={18} /></div>
            <strong>Correção assistida</strong>
            <p>A IA sugere. Você revisa e decide.</p>
          </div>
          <div className="teacher-profile">
            <div className="avatar">MC</div>
            <div><strong>Marina Costa</strong><span>Professora</span></div>
            <button aria-label="Mais opções do perfil" className="icon-button profile-more" type="button">
              <Icon name="more" />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area" id="painel">
        <header className="topbar">
          <div className="breadcrumbs">Visão geral <span>/</span> Painel</div>
          <div className="topbar-right">
            <span className="demo-label"><span /> Ambiente de demonstração</span>
            <button aria-label="Ajuda" className="help-button" type="button">?</button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="date-line">QUARTA-FEIRA, 4 DE NOVEMBRO DE 2026</p>
              <h1>Bom dia, Marina <span className="wave">✳</span></h1>
              <p className="page-subtitle">Acompanhe suas avaliações e revise as sugestões de correção.</p>
            </div>
            <button className="button button-primary new-question-button" onClick={() => setIsModalOpen(true)} type="button">
              <Icon name="plus" size={18} /> Nova questão
            </button>
          </div>

          {notice && (
            <div className="notice-success" role="status">
              <span className="notice-check"><Icon name="check" size={15} /></span>
              {notice}
              <button aria-label="Dispensar aviso" className="notice-close" onClick={() => setNotice("")} type="button">
                <Icon name="close" size={16} />
              </button>
            </div>
          )}

          <section aria-label="Resumo das avaliações" className="stats-grid" id="resumo">
            <StatCard icon="file" label="Respostas recebidas" note="Em todas as avaliações" tone="blue" value={responses.length} />
            <StatCard icon="clock" label="Aguardando revisão" note="Sugestões prontas para conferir" tone="amber" value={pendingCount} />
            <StatCard icon="check" label="Revisadas por você" note="Decisão final do professor" tone="green" value={reviewedCount} />
            <StatCard icon="book" label="Questões cadastradas" note="Com critérios de correção" tone="violet" value={questions.length} />
          </section>

          <section className="evaluation-section" id="respostas">
            <div className="section-heading">
              <div>
                <div className="section-title-row">
                  <h2>Respostas dos alunos</h2>
                  <span className="count-pill">{filteredResponses.length}</span>
                </div>
                <p>Confira a sugestão de correção e faça a revisão final.</p>
              </div>
              <label className="search-field">
                <Icon name="search" size={17} />
                <input
                  aria-label="Buscar respostas"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar aluno ou questão"
                  value={search}
                />
              </label>
            </div>

            <div className="filter-tabs" role="tablist" aria-label="Filtrar respostas">
              {["Todas", "Pendentes", "Revisadas"].map((filter) => (
                <button
                  aria-selected={activeFilter === filter}
                  className={`filter-tab ${activeFilter === filter ? "selected" : ""}`}
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  role="tab"
                  type="button"
                >
                  {filter}
                  {filter === "Pendentes" && <span>{pendingCount}</span>}
                </button>
              ))}
            </div>

            <div className="workbench">
              <div className="response-list">
                {filteredResponses.length ? filteredResponses.map((response) => {
                  const question = questionById[response.questaoId];
                  if (!question) return null;
                  const isActive = response.id === activeResponseId;
                  return (
                    <button
                      aria-pressed={isActive}
                      className={`response-row ${isActive ? "response-active" : ""}`}
                      key={response.id}
                      onClick={() => setActiveResponseId(response.id)}
                      type="button"
                    >
                      <span className="avatar student-avatar">{response.aluno.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                      <span className="response-main">
                        <strong>{response.aluno}</strong>
                        <span>{question.disciplina} <i>·</i> {response.turma}</span>
                        <span className="response-question">{question.enunciado}</span>
                      </span>
                      <span className="response-result">
                        <strong>{response.notaSugerida}<small>/{question.notaMaxima}</small></strong>
                        <StatusBadge status={response.status} />
                      </span>
                      <Icon className="row-arrow" name="arrow" size={17} />
                    </button>
                  );
                }) : (
                  <div className="empty-list">
                    <div className="empty-icon"><Icon name="search" size={21} /></div>
                    <strong>Nenhuma resposta encontrada</strong>
                    <span>Tente mudar a busca ou o filtro selecionado.</span>
                  </div>
                )}
              </div>

              {activeResponse && activeQuestion ? (
                <aside aria-label={`Detalhes da resposta de ${activeResponse.aluno}`} className="review-panel">
                  <div className="review-panel-heading">
                    <div>
                      <span className="eyebrow">REVISÃO DA RESPOSTA</span>
                      <h3>{activeResponse.aluno}</h3>
                    </div>
                    <StatusBadge status={activeResponse.status} />
                  </div>
                  <div className="review-meta">{activeQuestion.disciplina} <span>·</span> {activeResponse.turma}</div>
                  <div className="detail-block">
                    <span className="detail-label">QUESTÃO</span>
                    <p>{activeQuestion.enunciado}</p>
                  </div>
                  <div className="detail-block student-answer">
                    <span className="detail-label">RESPOSTA DO ALUNO</span>
                    <p>“{activeResponse.resposta}”</p>
                  </div>
                  <div className="ai-suggestion">
                    <div className="suggestion-heading">
                      <span className="suggestion-icon"><Icon name="sparkle" size={16} /></span>
                      <span>Sugestão da IA <small>MOCK</small></span>
                    </div>
                    <div className="suggested-grade">{activeResponse.notaSugerida}<span>/{activeQuestion.notaMaxima}</span></div>
                    <p>{activeResponse.comentarioIA}</p>
                  </div>
                  <div className="review-actions">
                    <p>A nota só é final após sua revisão.</p>
                    {activeResponse.status === "pendente" ? (
                      <button className="button button-review" onClick={approveResponse} type="button">
                        <Icon name="check" size={17} /> Marcar como revisada
                      </button>
                    ) : (
                      <div className="reviewed-message"><Icon name="check" size={16} /> Revisão concluída</div>
                    )}
                  </div>
                </aside>
              ) : (
                <aside className="review-panel no-selection">
                  <div className="empty-icon"><Icon name="file" size={21} /></div>
                  <strong>Selecione uma resposta</strong>
                  <span>Os detalhes e a sugestão de correção aparecerão aqui.</span>
                </aside>
              )}
            </div>
          </section>

          <section className="questions-section" id="questoes">
            <div className="section-heading question-heading">
              <div>
                <h2>Questões cadastradas</h2>
                <p>Gabaritos e critérios definidos para cada avaliação.</p>
              </div>
              <button className="text-button" onClick={() => setIsModalOpen(true)} type="button">
                Ver e cadastrar questões <Icon name="arrow" size={16} />
              </button>
            </div>
            <div className="question-grid">
              {questions.map((question) => (
                <article className="question-card" key={question.id}>
                  <div className="question-card-top">
                    <span className="subject-tag">{question.disciplina}</span>
                    <span className="question-score">{question.notaMaxima} pts</span>
                  </div>
                  <p>{question.enunciado}</p>
                  <div className="question-card-footer">
                    <span>{question.turma}</span><span>{responses.filter((response) => response.questaoId === question.id).length} respostas</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="page-footer">
            <span>Clareia <span className="brand-period">·</span> Correção assistida, decisão docente.</span>
            <span>Protótipo Sprint 1 · Dados demonstrativos</span>
          </footer>
        </div>
      </main>
      {isModalOpen && (
        <NewQuestionModal onClose={() => setIsModalOpen(false)} onCreate={createQuestion} />
      )}
    </div>
  );
}
