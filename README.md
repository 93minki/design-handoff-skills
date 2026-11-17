# Figma → DESIGN.md → React handoff

디자이너와 개발자가 Figma 디자인 시스템을 토큰, 컴포넌트 계약, React 코드로 연결하는 에이전트 스킬 모음입니다. Google Stitch의 `DESIGN.md` 형식을 협업 문서로 사용합니다.

## 구성

| 스킬 | 역할 | 주요 산출물 |
| --- | --- | --- |
| [`design-md`](design-md/SKILL.md) | Figma 디자인 시스템을 문서·토큰으로 변환 | `DESIGN.md`, `tailwind.theme.css`, `tokens.studio.global.json` |
| [`components`](components/SKILL.md) | 게시된 Figma 컴포넌트와 코드 컴포넌트 연결 | `COMPONENTS.md` |
| [`figma-implement`](figma-implement/SKILL.md) | 완료된 컴포넌트·페이지를 React로 구현 | 컴포넌트·라우트 코드, 필요한 매핑 갱신 |

전체 협업 순서와 변경 책임은 [WORKFLOW.md](WORKFLOW.md)에 정리했습니다.

## 설치

저장소 전체를 복제할 필요는 없습니다. Codex 사용자라면 대화에서 다음처럼 요청할 수 있습니다.

```text
$skill-installer를 사용해 93minki/design-handoff-skills 저장소의
design-md, components, figma-implement 스킬을 설치해줘.
```

직접 설치하려면 저장소를 복제한 뒤 스킬 **폴더 전체**를 설치 위치에 복사합니다. `SKILL.md`만 복사하면 `scripts/`와 `references/`가 빠집니다. 아래 명령은 macOS/Linux용입니다.

```bash
git clone https://github.com/93minki/design-handoff-skills.git
mkdir -p ~/.codex/skills
cp -R design-handoff-skills/{design-md,components,figma-implement} ~/.codex/skills/
```

Claude Code에서는 마지막 두 줄의 설치 위치를 `~/.claude/skills/`로 바꿉니다. 한 프로젝트에만 적용하려면 해당 프로젝트의 `.codex/skills/` 또는 `.claude/skills/`에 설치합니다. 같은 이름의 스킬이 이미 있다면 덮어쓰기 전에 기존 내용을 확인합니다.

## 빠른 사용

1. Figma 연결과 대상 파일·노드 접근 권한을 준비합니다.
2. 러프한 Figma 시스템에서 `design-md`로 초안 `DESIGN.md`만 만듭니다.
3. Stitch가 보완한 문서를 디자이너가 검토·승인한 뒤 `design-md`로 최종 문서와 CSS·JSON을 생성합니다.
4. 컴포넌트가 라이브러리에 게시되면 `components`, 이어서 `figma-implement`를 실행합니다.
5. 페이지 프레임이 완성되면 `figma-implement`로 라우트를 구현합니다.

각 스킬의 입력·검증 절차는 해당 `SKILL.md`를 따릅니다. `figma-implement`는 로드된 스킬의 설치 위치를 기준으로 검사 스크립트를 실행합니다.

## 범위

이 저장소는 스킬과 협업 절차를 공유합니다. 실제 프로젝트의 Figma 파일, `DESIGN.md`, 토큰 값, React 앱은 포함하지 않습니다. `WORKFLOW.md`는 제안하는 운영 모델이며, 기존 스킬의 역할 문구를 아직 개정하지 않았습니다.

`design-md/references/DESIGN_SPEC.md`는 Google의 DESIGN.md 사양에서 생성된 참조 파일입니다. 출처와 라이선스는 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)를 확인하세요.

## 라이선스

이 저장소의 원본 스킬·문서는 [Apache License 2.0](LICENSE)으로 배포합니다. Google 사양 참조 파일의 출처와 라이선스는 별도로 표시합니다.
