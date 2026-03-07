from manim import *

class PythagoreanTheorem(Scene):
    def construct(self):
        # Title
        title = Text("Pythagorean Theorem", font_size=52, color=BLUE_B)
        self.play(Write(title), run_time=1.2)
        self.play(title.animate.to_edge(UP))
        self.wait(0.5)

        # Right triangle
        A = np.array([-2, -1.5, 0])
        B = np.array([ 2, -1.5, 0])
        C = np.array([-2,  1.5, 0])

        tri = Polygon(A, B, C, color=WHITE, fill_color=BLUE_E, fill_opacity=0.3)
        right_mark = Square(side_length=0.3, color=WHITE).move_to(A + np.array([0.15, 0.15, 0]))

        label_a = MathTex("a", font_size=36, color=YELLOW).next_to(tri, LEFT, buff=0.3)
        label_b = MathTex("b", font_size=36, color=GREEN ).next_to(tri, DOWN, buff=0.3)
        label_c = MathTex("c", font_size=36, color=RED   ).move_to(np.array([0.4, 0.2, 0]))

        self.play(Create(tri), Create(right_mark))
        self.play(FadeIn(label_a), FadeIn(label_b), FadeIn(label_c))
        self.wait(0.8)

        # Squares on each side
        sq_a = Square(side_length=3, color=YELLOW, fill_color=YELLOW, fill_opacity=0.2
                      ).next_to(tri, LEFT, buff=0)
        sq_b = Square(side_length=4, color=GREEN, fill_color=GREEN, fill_opacity=0.2
                      ).next_to(tri, DOWN, buff=0)

        text_a2 = MathTex("a^2", color=YELLOW).move_to(sq_a.get_center())
        text_b2 = MathTex("b^2", color=GREEN ).move_to(sq_b.get_center())

        self.play(Create(sq_a), Write(text_a2), run_time=1)
        self.play(Create(sq_b), Write(text_b2), run_time=1)
        self.wait(0.5)

        # The formula
        formula = MathTex(r"a^2 + b^2 = c^2", font_size=56, color=WHITE)
        formula.to_edge(RIGHT).shift(LEFT * 0.5)
        box = SurroundingRectangle(formula, color=GOLD, buff=0.2)

        self.play(Write(formula), Create(box), run_time=1.5)
        self.wait(1)

        # Proof flash
        proof_note = Text("QED ✓", font_size=36, color=GOLD).next_to(box, DOWN)
        self.play(FadeIn(proof_note, shift=UP * 0.3))
        self.wait(1.5)
        self.play(*[FadeOut(m) for m in self.mobjects])

        end = Text("Proved!", font_size=64, color=GREEN)
        self.play(Write(end))
        self.wait(1.5)
