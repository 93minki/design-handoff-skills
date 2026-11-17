# Figma → DESIGN.md → React handoff

디자이너와 개발자가 Figma 디자인 시스템을 토큰, 컴포넌트 계약, React 코드로 연결하는 에이전트 스킬 모음입니다. Google Stitch의 `DESIGN.md` 형식을 협업 문서로 사용합니다.

## 구성

| 스킬 | 역할 | 주요 산출물 |
| --- | --- | --- |
| [`design-md`](design-md/SKILL.md) | Figma 디자인 시스템을 문서·토큰으로 변환 | `DESIGN.md`, `tailwind.theme.css`, `tokens.studio.global.json` |
| [`components`](components/SKILL.md) | 게시된 Figma 컴포넌트와 코드 컴포넌트 연결 | `COMPONENTS.md` |
| [`figma-implement`](figma-implement/SKILL.md) | 완료된 컴포넌트·페이지를 React로 구현 | 컴포넌트·라우트 코드, 필요한 매핑 갱신 |

전체 협업 순서와 변경 책임은 [WORKFLOW.md](WORKFLOW.md)에 정리했습니다.

## 빠른 사용

1. 이 저장소의 `design-md/`, `components/`, `figma-implement/` 폴더를 에이전트의 스킬 디렉터리에 설치합니다.
2. Figma 연결과 대상 파일·노드 접근 권한을 준비합니다.
3. 디자이너가 디자인 시스템을 확정한 뒤 `design-md`를 실행합니다.
4. 컴포넌트가 라이브러리에 게시되면 `components`, 이어서 `figma-implement`를 실행합니다.
5. 페이지 프레임이 완성되면 `figma-implement`로 라우트를 구현합니다.

각 스킬의 입력·검증 절차는 해당 `SKILL.md`를 따릅니다. 현재 `figma-implement/SKILL.md`의 Tailwind 검사 명령에는 작성자 컴퓨터의 절대 경로가 들어 있습니다. 다른 컴퓨터에서는 설치한 스킬 경로로 바꿔 실행해야 합니다.

## 범위

이 저장소는 스킬과 협업 절차를 공유합니다. 실제 프로젝트의 Figma 파일, `DESIGN.md`, 토큰 값, React 앱은 포함하지 않습니다. `WORKFLOW.md`는 제안하는 운영 모델이며, 기존 스킬의 역할 문구를 아직 개정하지 않았습니다.

`design-md/references/DESIGN_SPEC.md`는 Google의 DESIGN.md 사양에서 생성된 참조 파일입니다. 출처와 라이선스는 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)를 확인하세요.
